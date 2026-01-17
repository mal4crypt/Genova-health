const prisma = require('../config/prisma');

// Create delivery order
exports.createDeliveryOrder = async (req, res) => {
    try {
        const { prescriptionId, pharmacyId, deliveryAddress, deliveryPhone, notes } = req.body;

        // Get patient ID from user
        const patient = await prisma.patient.findUnique({
            where: { user_id: req.user.id }
        });

        if (!patient) {
            return res.status(403).json({ message: 'Only patients can request delivery' });
        }

        // Verify prescription belongs to patient
        const prescription = await prisma.prescription.findFirst({
            where: {
                id: parseInt(prescriptionId),
                patient_id: patient.id
            }
        });

        if (!prescription) {
            return res.status(404).json({ message: 'Prescription not found' });
        }

        // Create delivery order
        const delivery = await prisma.deliveryOrder.create({
            data: {
                prescription_id: parseInt(prescriptionId),
                patient_id: patient.id,
                pharmacy_id: parseInt(pharmacyId),
                delivery_address: deliveryAddress,
                delivery_phone: deliveryPhone,
                notes,
                status: 'pending',
                delivery_fee: 1500.00
            }
        });

        res.status(201).json({ delivery });
    } catch (error) {
        console.error('Create delivery order error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Assign driver to delivery
exports.assignDriver = async (req, res) => {
    try {
        const { deliveryId } = req.params;
        const { driverId } = req.body;
        const id = parseInt(deliveryId);
        const dId = parseInt(driverId);

        // Verify driver is online
        const driver = await prisma.driver.findFirst({
            where: {
                id: dId,
                is_online: true
            }
        });

        if (!driver) {
            return res.status(400).json({ message: 'Driver not available' });
        }

        const delivery = await prisma.deliveryOrder.update({
            where: { id },
            data: {
                driver_id: dId,
                status: 'assigned',
                assigned_at: new Date()
            }
        });

        res.json({ delivery });
    } catch (error) {
        console.error('Assign driver error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Delivery order not found' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// Update delivery status
exports.updateDeliveryStatus = async (req, res) => {
    try {
        const { deliveryId } = req.params;
        const { status } = req.body;
        const id = parseInt(deliveryId);

        const validStatuses = ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const updateData = { status };

        // Update timestamps based on status
        if (status === 'picked_up') {
            updateData.picked_up_at = new Date();
        } else if (status === 'delivered') {
            updateData.delivered_at = new Date();
        }

        // Use transaction to update both delivery and prescription if delivered
        const result = await prisma.$transaction(async (prisma) => {
            const delivery = await prisma.deliveryOrder.update({
                where: { id },
                data: updateData
            });

            if (status === 'delivered') {
                await prisma.prescription.update({
                    where: { id: delivery.prescription_id },
                    data: { status: 'delivered' }
                });
            }

            return delivery;
        });

        res.json({ delivery: result });
    } catch (error) {
        console.error('Update delivery status error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Delivery order not found' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// Get driver's deliveries
exports.getDriverDeliveries = async (req, res) => {
    try {
        const { status } = req.query;

        // Get driver ID from user
        const driver = await prisma.driver.findUnique({
            where: { user_id: req.user.id }
        });

        if (!driver) {
            return res.status(403).json({ message: 'Only drivers can access this' });
        }

        let whereClause = { driver_id: driver.id };
        if (status) {
            whereClause.status = status;
        }

        const deliveries = await prisma.deliveryOrder.findMany({
            where: whereClause,
            orderBy: { created_at: 'desc' },
            include: {
                patient: {
                    select: {
                        full_name: true,
                        phone: true
                    }
                },
                prescription: {
                    select: {
                        medication: true,
                        dosage: true
                    }
                },
                pharmacy: {
                    select: {
                        name: true,
                        address: true,
                        phone: true
                    }
                }
            }
        });

        // Flatten response
        const formattedDeliveries = deliveries.map(d => ({
            ...d,
            patient_name: d.patient.full_name,
            patient_phone: d.patient.phone,
            medication: d.prescription.medication,
            dosage: d.prescription.dosage,
            pharmacy_name: d.pharmacy ? d.pharmacy.name : null,
            pharmacy_address: d.pharmacy ? d.pharmacy.address : null,
            pharmacy_phone: d.pharmacy ? d.pharmacy.phone : null
        }));

        res.json({ deliveries: formattedDeliveries });
    } catch (error) {
        console.error('Get driver deliveries error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get patient's deliveries
exports.getPatientDeliveries = async (req, res) => {
    try {
        // Get patient ID from user
        const patient = await prisma.patient.findUnique({
            where: { user_id: req.user.id }
        });

        if (!patient) {
            return res.status(403).json({ message: 'Only patients can access this' });
        }

        const deliveries = await prisma.deliveryOrder.findMany({
            where: { patient_id: patient.id },
            orderBy: { created_at: 'desc' },
            include: {
                prescription: {
                    select: {
                        medication: true,
                        dosage: true,
                        frequency: true
                    }
                },
                driver: {
                    select: {
                        full_name: true,
                        plate_number: true
                    }
                },
                pharmacy: {
                    select: {
                        name: true
                    }
                }
            }
        });

        // Flatten response
        const formattedDeliveries = deliveries.map(d => ({
            ...d,
            medication: d.prescription.medication,
            dosage: d.prescription.dosage,
            frequency: d.prescription.frequency,
            driver_name: d.driver ? d.driver.full_name : null,
            driver_plate: d.driver ? d.driver.plate_number : null,
            pharmacy_name: d.pharmacy ? d.pharmacy.name : null
        }));

        res.json({ deliveries: formattedDeliveries });
    } catch (error) {
        console.error('Get patient deliveries error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Track delivery (real-time)
exports.trackDelivery = async (req, res) => {
    try {
        const { deliveryId } = req.params;
        const id = parseInt(deliveryId);

        const delivery = await prisma.deliveryOrder.findUnique({
            where: { id },
            include: {
                driver: {
                    select: {
                        full_name: true,
                        plate_number: true,
                        current_location: true,
                        is_online: true
                    }
                }
            }
        });

        if (!delivery) {
            return res.status(404).json({ message: 'Delivery not found' });
        }

        // Flatten response
        const formattedDelivery = {
            ...delivery,
            driver_name: delivery.driver ? delivery.driver.full_name : null,
            driver_plate: delivery.driver ? delivery.driver.plate_number : null,
            driver_location: delivery.driver ? delivery.driver.current_location : null,
            driver_online: delivery.driver ? delivery.driver.is_online : null
        };

        res.json({ delivery: formattedDelivery });
    } catch (error) {
        console.error('Track delivery error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get available drivers for assignment
exports.getAvailableDrivers = async (req, res) => {
    try {
        const drivers = await prisma.driver.findMany({
            where: { is_online: true },
            orderBy: { full_name: 'asc' },
            include: {
                user: {
                    select: { email: true }
                }
            }
        });

        const formattedDrivers = drivers.map(d => ({
            ...d,
            email: d.user.email
        }));

        res.json({ drivers: formattedDrivers });
    } catch (error) {
        console.error('Get available drivers error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
