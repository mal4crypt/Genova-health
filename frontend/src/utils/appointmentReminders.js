// Appointment Reminder Utilities
// Backend notification service for SMS, Email, and Push notifications

export const sendAppointmentReminder = async (appointment, type = 'sms') => {
    const { patient, doctor, appointmentTime, appointmentId } = appointment;

    const reminderTemplates = {
        sms: `Hi ${patient.name}, reminder: You have an appointment with Dr. ${doctor.name} on ${appointmentTime}. Reply YES to confirm or CANCEL to reschedule. - Genova Health`,

        email: {
            subject: `Appointment Reminder - ${appointmentTime}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2E7D32;">Appointment Reminder</h2>
                    <p>Hello ${patient.name},</p>
                    <p>This is a reminder about your upcoming appointment:</p>
                    <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <p><strong>Doctor:</strong> Dr. ${doctor.name}</p>
                        <p><strong>Date & Time:</strong> ${appointmentTime}</p>
                        <p><strong>Appointment ID:</strong> #${appointmentId}</p>
                    </div>
                    <p>
                        <a href="https://genova--health.web.app/confirm/${appointmentId}" 
                           style="background: #2E7D32; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            Confirm Appointment
                        </a>
                        &nbsp;&nbsp;
                        <a href="https://genova--health.web.app/reschedule/${appointmentId}" 
                           style="background: #666; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                            Reschedule
                        </a>
                    </p>
                    <p style="color: #666; font-size: 12px; margin-top: 30px;">
                        If you need to cancel, please do so at least 24 hours in advance.<br>
                        For questions, contact us at support@genova-health.com
                    </p>
                </div>
            `
        },

        push: {
            title: 'Appointment Reminder',
            body: `Dr. ${doctor.name} - ${appointmentTime}`,
            data: {
                appointmentId,
                action: 'view_appointment'
            }
        }
    };

    try {
        const token = localStorage.getItem('token');

        if (type === 'sms') {
            // Integrate with Twilio or similar SMS service
            await fetch('http://localhost:5000/api/notifications/sms', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    to: patient.phone,
                    message: reminderTemplates.sms
                })
            });
        } else if (type === 'email') {
            // Integrate with SendGrid or similar email service
            await fetch('http://localhost:5000/api/notifications/email', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    to: patient.email,
                    subject: reminderTemplates.email.subject,
                    html: reminderTemplates.email.html
                })
            });
        } else if (type === 'push') {
            // Web Push Notification
            if ('serviceWorker' in navigator && 'PushManager' in window) {
                const registration = await navigator.serviceWorker.ready;
                await registration.showNotification(
                    reminderTemplates.push.title,
                    {
                        body: reminderTemplates.push.body,
                        icon: '/icon-192.png',
                        badge: '/icon-192.png',
                        data: reminderTemplates.push.data,
                        actions: [
                            { action: 'confirm', title: 'Confirm' },
                            { action: 'reschedule', title: 'Reschedule' }
                        ]
                    }
                );
            }
        }

        return { success: true };
    } catch (error) {
        console.error('Failed to send reminder:', error);
        return { success: false, error };
    }
};

// Schedule reminders at different intervals
export const scheduleAppointmentReminders = (appointment) => {
    const appointmentDate = new Date(appointment.appointmentTime);
    const now = new Date();

    // 24 hours before
    const oneDayBefore = new Date(appointmentDate);
    oneDayBefore.setHours(appointmentDate.getHours() - 24);

    // 2 hours before
    const twoHoursBefore = new Date(appointmentDate);
    twoHoursBefore.setHours(appointmentDate.getHours() - 2);

    const reminders = [];

    if (oneDayBefore > now) {
        reminders.push({
            time: oneDayBefore,
            types: ['email', 'push']
        });
    }

    if (twoHoursBefore > now) {
        reminders.push({
            time: twoHoursBefore,
            types: ['sms', 'push']
        });
    }

    return reminders;
};

// Calendar integration
export const addToCalendar = (appointment) => {
    const { doctor, appointmentTime, duration = 30 } = appointment;

    const startTime = new Date(appointmentTime);
    const endTime = new Date(startTime.getTime() + duration * 60000);

    const formatDate = (date) => {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    // Google Calendar URL
    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Appointment with Dr. ${doctor.name}`)}&dates=${formatDate(startTime)}/${formatDate(endTime)}&details=${encodeURIComponent('Healthcare appointment via Genova Health')}&location=Virtual`;

    // iCal format (for Apple Calendar, Outlook)
    const icalContent = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:${formatDate(startTime)}
DTEND:${formatDate(endTime)}
SUMMARY:Appointment with Dr. ${doctor.name}
DESCRIPTION:Healthcare appointment via Genova Health
LOCATION:Virtual
STATUS:CONFIRMED
BEGIN:VALARM
TRIGGER:-PT24H
ACTION:DISPLAY
DESCRIPTION:Appointment Reminder
END:VALARM
BEGIN:VALARM
TRIGGER:-PT2H
ACTION:DISPLAY
DESCRIPTION:Appointment in 2 hours
END:VALARM
END:VEVENT
END:VCALENDAR`;

    return {
        googleCalendar: googleCalendarUrl,
        ical: `data:text/calendar;charset=utf8,${encodeURIComponent(icalContent)}`
    };
};

export default {
    send AppointmentReminder,
    scheduleAppointmentReminders,
    addToCalendar
};
