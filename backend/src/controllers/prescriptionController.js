const pool = require('../config/database');

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
        const doctorResult = await pool.query(
            'SELECT id FROM doctors WHERE user_id = $1',
            [req.user.id]
        );

        if (doctorResult.rows.length === 0) {
            return res.status(403).json({ message: 'Only doctors can create prescriptions' });
        }

        const doctorId = doctorResult.rows[0].id;

        // Create prescription
        const result = await pool.query(
            `INSERT INTO prescriptions 
             (doctor_id, patient_id, medication, dosage, frequency, duration, instructions, diagnosis, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
             RETURNING *`,
            [doctorId, patientId, medication, dosage, frequency, duration, instructions, diagnosis]
        );

        res.status(201).json({ prescription: result.rows[0] });
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

        let query;
        let params = [];

        if (userRole === 'doctor') {
            const doctorResult = await pool.query(
                'SELECT id FROM doctors WHERE user_id = $1',
                [userId]
            );
            const doctorId = doctorResult.rows[0]?.id;

            query = `
                SELECT p.*, 
                       pt.full_name as patient_name,
                       pt.phone as patient_phone,
                       d.full_name as doctor_name
                FROM prescriptions p
                JOIN patients pt ON p.patient_id = pt.id
                JOIN doctors d ON p.doctor_id = d.id
                WHERE p.doctor_id = $1
            `;
            params = [doctorId];
        } else if (userRole === 'patient') {
            const patientResult = await pool.query(
                'SELECT id FROM patients WHERE user_id = $1',
                [userId]
            );
            const patientId = patientResult.rows[0]?.id;

            query = `
                SELECT p.*, 
                       pt.full_name as patient_name,
                       d.full_name as doctor_name,
                       d.specialty as doctor_specialty
                FROM prescriptions p
                JOIN patients pt ON p.patient_id = pt.id
                JOIN doctors d ON p.doctor_id = d.id
                WHERE p.patient_id = $1
            `;
            params = [patientId];
        } else {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Add status filter if provided
        if (status) {
            query += ` AND p.status = $${params.length + 1}`;
            params.push(status);
        }

        query += ` ORDER BY p.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
        params.push(limit, offset);

        const result = await pool.query(query, params);
        res.json({ prescriptions: result.rows });
    } catch (error) {
        console.error('Get prescriptions error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get single prescription
exports.getPrescriptionById = async (req, res) => {
    try {
        const { prescriptionId } = req.params;

        const result = await pool.query(
            `SELECT p.*, 
                    pt.full_name as patient_name,
                    pt.phone as patient_phone,
                    pt.allergies as patient_allergies,
                    d.full_name as doctor_name,
                    d.specialty as doctor_specialty,
                    d.hospital as doctor_hospital
             FROM prescriptions p
             JOIN patients pt ON p.patient_id = pt.id
             JOIN doctors d ON p.doctor_id = d.id
             WHERE p.id = $1`,
            [prescriptionId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Prescription not found' });
        }

        res.json({ prescription: result.rows[0] });
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

        const validStatuses = ['pending', 'ready', 'dispensed', 'delivered'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const result = await pool.query(
            `UPDATE prescriptions 
             SET status = $1, updated_at = CURRENT_TIMESTAMP
             WHERE id = $2
             RETURNING *`,
            [status, prescriptionId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Prescription not found' });
        }

        res.json({ prescription: result.rows[0] });
    } catch (error) {
        console.error('Update prescription status error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get pharmacies
exports.getPharmacies = async (req, res) => {
    try {
        const { lat, lng, radius = 10 } = req.query;

        let query = 'SELECT * FROM pharmacies';

        // If coordinates provided, calculate distance
        if (lat && lng) {
            query = `
                SELECT *,
                       (6371 * acos(cos(radians($1)) * cos(radians(latitude)) * 
                       cos(radians(longitude) - radians($2)) + sin(radians($1)) * 
                       sin(radians(latitude)))) AS distance
                FROM pharmacies
                HAVING distance < $3
                ORDER BY distance
            `;
            const result = await pool.query(query, [lat, lng, radius]);
            return res.json({ pharmacies: result.rows });
        }

        const result = await pool.query(query);
        res.json({ pharmacies: result.rows });
    } catch (error) {
        console.error('Get pharmacies error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
