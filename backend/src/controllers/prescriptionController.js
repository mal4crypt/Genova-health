const prisma = require('../config/prisma');

// Create prescription (doctors only)
exports.createPrescription = async (req, res) => {
    try {
        const {
            patientId,
            medication,
            dosage,
            frequency,
            duration,
            instructions,
            diagnosis
        } = req.body;

        // Get doctor's ID from user
        const doctor = await prisma.doctor.findUnique({
            where: { user_id: req.user.id }
        });

        if (!doctor) {
            return res.status(403).json({ message: 'Only doctors can create prescriptions' });
        }

        // Create prescription
        const prescription = await prisma.prescription.create({
            data: {
                doctor_id: doctor.id,
                patient_id: parseInt(patientId),
                medication,
                dosage,
                frequency,
                duration,
                instructions,
                diagnosis,
                status: 'pending'
            }
        });

        res.status(201).json({ prescription });
    } catch (error) {
        console.error('Create prescription error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get prescriptions
exports.getPrescriptions = async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;
        const { status, limit = 20, offset = 0 } = req.query;

        let whereClause = {};

        if (userRole === 'doctor') {
            const doctor = await prisma.doctor.findUnique({ where: { user_id: userId } });
            if (!doctor) return res.status(404).json({ message: 'Doctor profile not found' });
            whereClause = { doctor_id: doctor.id };
        } else if (userRole === 'patient') {
            const patient = await prisma.patient.findUnique({ where: { user_id: userId } });
            if (!patient) return res.status(404).json({ message: 'Patient profile not found' });
            whereClause = { patient_id: patient.id };
        } else {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Add status filter if provided
        if (status) {
            whereClause.status = status;
        }

        const prescriptions = await prisma.prescription.findMany({
            where: whereClause,
            orderBy: { created_at: 'desc' },
            take: parseInt(limit),
            skip: parseInt(offset),
            include: {
                patient: {
                    select: {
                        full_name: true,
                        phone: true
                    }
                },
                doctor: {
                    select: {
                        full_name: true,
                        specialty: true
                    }
                }
            }
        });

        // Flatten response to match previous structure
        const formattedPrescriptions = prescriptions.map(p => ({
            ...p,
            patient_name: p.patient.full_name,
            patient_phone: p.patient.phone,
            doctor_name: p.doctor.full_name,
            doctor_specialty: p.doctor.specialty
        }));

        res.json({ prescriptions: formattedPrescriptions });
    } catch (error) {
        console.error('Get prescriptions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get single prescription
exports.getPrescriptionById = async (req, res) => {
    try {
        const { prescriptionId } = req.params;
        const id = parseInt(prescriptionId);

        const prescription = await prisma.prescription.findUnique({
            where: { id },
            include: {
                patient: {
                    select: {
                        full_name: true,
                        phone: true,
                        allergies: true
                    }
                },
                doctor: {
                    select: {
                        full_name: true,
                        specialty: true,
                        hospital: true
                    }
                }
            }
        });

        if (!prescription) {
            return res.status(404).json({ message: 'Prescription not found' });
        }

        // Flatten response
        const formattedPrescription = {
            ...prescription,
            patient_name: prescription.patient.full_name,
            patient_phone: prescription.patient.phone,
            patient_allergies: prescription.patient.allergies,
            doctor_name: prescription.doctor.full_name,
            doctor_specialty: prescription.doctor.specialty,
            doctor_hospital: prescription.doctor.hospital
        };

        res.json({ prescription: formattedPrescription });
    } catch (error) {
        console.error('Get prescription error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update prescription status
exports.updatePrescriptionStatus = async (req, res) => {
    try {
        const { prescriptionId } = req.params;
        const { status } = req.body;
        const id = parseInt(prescriptionId);

        const validStatuses = ['pending', 'ready', 'dispensed', 'delivered'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const prescription = await prisma.prescription.update({
            where: { id },
            data: { status }
        });

        res.json({ prescription });
    } catch (error) {
        console.error('Update prescription status error:', error);
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'Prescription not found' });
        }
        res.status(500).json({ message: 'Server error' });
    }
};

// Get pharmacies
exports.getPharmacies = async (req, res) => {
    try {
        const { lat, lng, radius = 10 } = req.query;

        if (lat && lng) {
            // Use raw query for distance calculation as Prisma doesn't support geospatial queries natively yet
            const latitude = parseFloat(lat);
            const longitude = parseFloat(lng);
            const distance = parseFloat(radius);

            const pharmacies = await prisma.$queryRaw`
                SELECT *,
                       (6371 * acos(cos(radians(${latitude})) * cos(radians(latitude)) * 
                       cos(radians(longitude) - radians(${longitude})) + sin(radians(${latitude})) * 
                       sin(radians(latitude)))) AS distance
                FROM pharmacies
                WHERE (6371 * acos(cos(radians(${latitude})) * cos(radians(latitude)) * 
                       cos(radians(longitude) - radians(${longitude})) + sin(radians(${latitude})) * 
                       sin(radians(latitude)))) < ${distance}
                ORDER BY distance
            `;
            return res.json({ pharmacies });
        }

        const pharmacies = await prisma.pharmacy.findMany();
        res.json({ pharmacies });
    } catch (error) {
        console.error('Get pharmacies error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
