const pool = require('../config/database');

// Create delivery order
exports.createDeliveryOrder = async (req, res) => {
    try {
        const { prescriptionId, pharmacyId, deliveryAddress, deliveryPhone, notes } = req.body;

        // Get patient ID from user
        const patientResult = await pool.query(
            'SELECT id FROM patients WHERE user_id = $1',
            [req.user.id]
        );

        if (patientResult.rows.length === 0) {
            return res.status(403).json({ message: 'Only patients can request delivery' });
        }

        const patientId = patientResult.rows[0].id;

        // Verify prescription belongs to patient
        const prescriptionCheck = await pool.query(
            'SELECT * FROM prescriptions WHERE id = $1 AND patient_id = $2',
            [prescriptionId, patientId]
        );

        if (prescriptionCheck.rows.length === 0) {
            return res.status(404).json({ message: 'Prescription not found' });
        }

        // Create delivery order
        const result = await pool.query(
            `INSERT INTO delivery_orders 
             (prescription_id, patient_id, pharmacy_id, delivery_address, delivery_phone, notes, status, delivery_fee)
             VALUES ($1, $2, $3, $4, $5, $6, 'pending', 1500.00)
             RETURNING *`,
            [prescriptionId, patientId, pharmacyId, deliveryAddress, deliveryPhone, notes]
        );

        res.status(201).json({ delivery: result.rows[0] });
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

        // Verify driver is online
        const driverCheck = await pool.query(
            'SELECT * FROM drivers WHERE id = $1 AND is_online = true',
            [driverId]
        );

        if (driverCheck.rows.length === 0) {
            return res.status(400).json({ message: 'Driver not available' });
        }

        const result = await pool.query(
            `UPDATE delivery_orders 
             SET driver_id = $1, status = 'assigned', assigned_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING *`,
            [driverId, deliveryId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Delivery order not found' });
        }

        res.json({ delivery: result.rows[0] });
    } catch (error) {
        console.error('Assign driver error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update delivery status
exports.updateDeliveryStatus = async (req, res) => {
    try {
        const { deliveryId } = req.params;
        const { status } = req.body;

        const validStatuses = ['pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        let updateFields = 'status = $1';
        const params = [status, deliveryId];

        // Update timestamps based on status
        if (status === 'picked_up') {
            updateFields += ', picked_up_at = CURRENT_TIMESTAMP';
        } else if (status === 'delivered') {
            updateFields += ', delivered_at = CURRENT_TIMESTAMP';
            // Also update prescription status
            await pool.query(
                `UPDATE prescriptions 
                 SET status = 'delivered' 
                 WHERE id = (SELECT prescription_id FROM delivery_orders WHERE id = $1)`,
                [deliveryId]
            );
        }

        const result = await pool.query(
            `UPDATE delivery_orders 
             SET ${updateFields}
             WHERE id = $2
             RETURNING *`,
            params
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Delivery order not found' });
        }

        res.json({ delivery: result.rows[0] });
    } catch (error) {
        console.error('Update delivery status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get driver's deliveries
exports.getDriverDeliveries = async (req, res) => {
    try {
        const { status } = req.query;

        // Get driver ID from user
        const driverResult = await pool.query(
            'SELECT id FROM drivers WHERE user_id = $1',
            [req.user.id]
        );

        if (driverResult.rows.length === 0) {
            return res.status(403).json({ message: 'Only drivers can access this' });
        }

        const driverId = driverResult.rows[0].id;

        let query = `
            SELECT do.*, 
                   p.full_name as patient_name,
                   p.phone as patient_phone,
                   pr.medication,
                   pr.dosage,
                   ph.name as pharmacy_name,
                   ph.address as pharmacy_address,
                   ph.phone as pharmacy_phone
            FROM delivery_orders do
            JOIN patients p ON do.patient_id = p.id
            JOIN prescriptions pr ON do.prescription_id = pr.id
            LEFT JOIN pharmacies ph ON do.pharmacy_id = ph.id
            WHERE do.driver_id = $1
        `;
        const params = [driverId];

        if (status) {
            query += ` AND do.status = $2`;
            params.push(status);
        }

        query += ` ORDER BY do.created_at DESC`;

        const result = await pool.query(query, params);
        res.json({ deliveries: result.rows });
    } catch (error) {
        console.error('Get driver deliveries error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get patient's deliveries
exports.getPatientDeliveries = async (req, res) => {
    try {
        // Get patient ID from user
        const patientResult = await pool.query(
            'SELECT id FROM patients WHERE user_id = $1',
            [req.user.id]
        );

        if (patientResult.rows.length === 0) {
            return res.status(403).json({ message: 'Only patients can access this' });
        }

        const patientId = patientResult.rows[0].id;

        const result = await pool.query(
            `SELECT do.*, 
                    pr.medication,
                    pr.dosage,
                    pr.frequency,
                    d.full_name as driver_name,
                    d.plate_number as driver_plate,
                    ph.name as pharmacy_name
             FROM delivery_orders do
             JOIN prescriptions pr ON do.prescription_id = pr.id
             LEFT JOIN drivers d ON do.driver_id = d.id
             LEFT JOIN pharmacies ph ON do.pharmacy_id = ph.id
             WHERE do.patient_id = $1
             ORDER BY do.created_at DESC`,
            [patientId]
        );

        res.json({ deliveries: result.rows });
    } catch (error) {
        console.error('Get patient deliveries error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Track delivery (real-time)
exports.trackDelivery = async (req, res) => {
    try {
        const { deliveryId } = req.params;

        const result = await pool.query(
            `SELECT do.*, 
                    d.full_name as driver_name,
                    d.plate_number as driver_plate,
                    d.current_location as driver_location,
                    d.is_online as driver_online
             FROM delivery_orders do
             LEFT JOIN drivers d ON do.driver_id = d.id
             WHERE do.id = $1`,
            [deliveryId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Delivery not found' });
        }

        res.json({ delivery: result.rows[0] });
    } catch (error) {
        console.error('Track delivery error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get available drivers for assignment
exports.getAvailableDrivers = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT d.*, u.email
             FROM drivers d
             JOIN users u ON d.user_id = u.id
             WHERE d.is_online = true
             ORDER BY d.full_name`
        );

        res.json({ drivers: result.rows });
    } catch (error) {
        console.error('Get available drivers error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
