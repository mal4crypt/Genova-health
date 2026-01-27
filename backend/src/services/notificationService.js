const sgMail = require('@sendgrid/mail');
const twilio = require('twilio');

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Initialize Twilio
const twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
);

// Send email
exports.sendEmail = async (to, subject, html) => {
    try {
        const msg = {
            to,
            from: process.env.SENDGRID_FROM_EMAIL || 'noreply@genova-health.com',
            subject,
            html,
        };

        await sgMail.send(msg);
        console.log(`Email sent to ${to}`);
        return { success: true };
    } catch (error) {
        console.error('Email error:', error);
        return { success: false, error: error.message };
    }
};

// Send appointment confirmation email
exports.sendAppointmentConfirmation = async (appointment, patientEmail) => {
    const subject = 'Appointment Confirmation - Genova Health';
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">Appointment Confirmed</h2>
            <p>Your appointment has been successfully scheduled.</p>
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Date:</strong> ${new Date(appointment.scheduled_at).toLocaleDateString()}</p>
                <p><strong>Time:</strong> ${new Date(appointment.scheduled_at).toLocaleTimeString()}</p>
                <p><strong>Duration:</strong> ${appointment.duration_mins} minutes</p>
                <p><strong>Doctor:</strong> ${appointment.doctor?.full_name || 'TBD'}</p>
            </div>
            <p>Please arrive 10 minutes early for your appointment.</p>
            <p style="color: #6b7280; font-size: 12px;">If you need to reschedule, please contact us at least 24 hours in advance.</p>
        </div>
    `;

    return await this.sendEmail(patientEmail, subject, html);
};

// Send SMS
exports.sendSMS = async (to, message) => {
    try {
        const result = await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to
        });

        console.log(`SMS sent to ${to}: ${result.sid}`);
        return { success: true, sid: result.sid };
    } catch (error) {
        console.error('SMS error:', error);
        return { success: false, error: error.message };
    }
};

// Send appointment reminder SMS
exports.sendAppointmentReminderSMS = async (phone, appointment) => {
    const message = `Reminder: Your appointment at Genova Health is scheduled for ${new Date(appointment.scheduled_at).toLocaleString()}. Please arrive 10 minutes early.`;
    return await this.sendSMS(phone, message);
};

// Send password reset email
exports.sendPasswordResetEmail = async (email, resetToken) => {
    const subject = 'Reset Your Password - Genova Health';
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #3b82f6;">Password Reset Request</h2>
            <p>You requested to reset your password. Click the button below to proceed:</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}" 
                   style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                    Reset Password
                </a>
            </div>
            <p style="color: #6b7280; font-size: 12px;">This link will expire in 1 hour. If you didn't request this, please ignore this email.</p>
        </div>
    `;

    return await this.sendEmail(email, subject, html);
};

// Send medication reminder
exports.sendMedicationReminderSMS = async (phone, medicationName, dosage) => {
    const message = `💊 Medication Reminder: Time to take ${medicationName} (${dosage}). Stay healthy!`;
    return await this.sendSMS(phone, message);
};
