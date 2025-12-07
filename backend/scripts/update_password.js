const bcrypt = require('bcryptjs');
const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
    user: process.env.DB_USER || 'genova_admin',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'genova_health',
    password: process.env.DB_PASSWORD || 'genova_secure_2024',
    port: process.env.DB_PORT || 5432,
});

const updatePassword = async () => {
    const email = 'mal4crypt404@gmail.com';
    const newPassword = 'thetaskmaster17';

    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(newPassword, salt);

        console.log(`New Hash for '${newPassword}': ${hash}`);

        const res = await pool.query(
            'UPDATE users SET password_hash = $1 WHERE email = $2 RETURNING id, email',
            [hash, email]
        );

        if (res.rows.length > 0) {
            console.log(`Successfully updated password for ${res.rows[0].email}`);
        } else {
            console.log(`User with email ${email} not found.`);
        }
    } catch (err) {
        console.error('Error updating password:', err);
    } finally {
        await pool.end();
    }
};

updatePassword();
