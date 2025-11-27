const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.register = async (req, res) => {
    const { email, password, role, ...profileData } = req.body;

    try {
        // Check if user exists
        const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userCheck.rows.length > 0) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create User
        const newUser = await db.query(
            'INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role',
            [email, hashedPassword, role]
        );
        const userId = newUser.rows[0].id;

        // Create Role-Specific Profile
        if (role === 'patient') {
            await db.query(
                'INSERT INTO patients (user_id, full_name, age, blood_group, genotype, height, weight, allergies, phone) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
                [userId, profileData.fullName, profileData.age, profileData.bloodGroup, profileData.genotype, profileData.height, profileData.weight, profileData.allergies, profileData.phone]
            );
        } else if (role === 'doctor') {
            await db.query(
                'INSERT INTO doctors (user_id, full_name, specialty, hospital, experience_years, license_number) VALUES ($1, $2, $3, $4, $5, $6)',
                [userId, profileData.fullName, profileData.specialty, profileData.hospital, profileData.experience, profileData.licenseNumber]
            );
        } else if (role === 'nurse') {
            await db.query(
                'INSERT INTO nurses (user_id, full_name, registration_number, facility) VALUES ($1, $2, $3, $4)',
                [userId, profileData.fullName, profileData.registrationNumber, profileData.facility]
            );
        } else if (role === 'driver') {
            await db.query(
                'INSERT INTO drivers (user_id, full_name, driver_id, plate_number) VALUES ($1, $2, $3, $4)',
                [userId, profileData.fullName, profileData.driverId, profileData.plateNumber]
            );
        }

        res.status(201).json({
            id: userId,
            email: newUser.rows[0].email,
            role: newUser.rows[0].role,
            token: generateToken(userId, role)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);

        if (user.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.rows[0].password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const role = user.rows[0].role;
        let profile;

        if (role === 'patient') {
            profile = await db.query('SELECT * FROM patients WHERE user_id = $1', [user.rows[0].id]);
        } else if (role === 'doctor') {
            profile = await db.query('SELECT * FROM doctors WHERE user_id = $1', [user.rows[0].id]);
        } else if (role === 'nurse') {
            profile = await db.query('SELECT * FROM nurses WHERE user_id = $1', [user.rows[0].id]);
        } else if (role === 'driver') {
            profile = await db.query('SELECT * FROM drivers WHERE user_id = $1', [user.rows[0].id]);
        }

        res.json({
            id: user.rows[0].id,
            email: user.rows[0].email,
            role: role,
            profile: profile.rows[0],
            token: generateToken(user.rows[0].id, role)
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
