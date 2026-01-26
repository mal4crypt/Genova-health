const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const prisma = require('../config/prisma');

// Create payment intent
exports.createPaymentIntent = async (req, res) => {
    const { amount, currency = 'USD', description, appointmentId } = req.body;
    const userId = req.user.id;

    try {
        // Create Stripe payment intent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // Convert to cents
            currency: currency.toLowerCase(),
            metadata: {
                userId: userId.toString(),
                appointmentId: appointmentId?.toString() || ''
            }
        });

        // Save to database
        const payment = await prisma.payment.create({
            data: {
                user_id: userId,
                amount,
                currency,
                stripe_payment_id: paymentIntent.id,
                status: 'pending',
                description,
                appointment_id: appointmentId
            }
        });

        res.json({
            clientSecret: paymentIntent.client_secret,
            paymentId: payment.id
        });
    } catch (error) {
        console.error('Create payment intent error:', error);
        res.status(500).json({ error: 'Failed to create payment' });
    }
};

// Confirm payment
exports.confirmPayment = async (req, res) => {
    const { paymentIntentId } = req.body;

    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        // Update database
        await prisma.payment.updateMany({
            where: { stripe_payment_id: paymentIntentId },
            data: {
                status: paymentIntent.status === 'succeeded' ? 'succeeded' : 'failed'
            }
        });

        res.json({
            success: paymentIntent.status === 'succeeded',
            status: paymentIntent.status
        });
    } catch (error) {
        console.error('Confirm payment error:', error);
        res.status(500).json({ error: 'Failed to confirm payment' });
    }
};

// Get payment history
exports.getPaymentHistory = async (req, res) => {
    const userId = req.user.id;

    try {
        const payments = await prisma.payment.findMany({
            where: { user_id: userId },
            orderBy: { created_at: 'desc' },
            take: 50
        });

        res.json(payments);
    } catch (error) {
        console.error('Get payment history error:', error);
        res.status(500).json({ error: 'Failed to fetch history' });
    }
};

// Process refund
exports.processRefund = async (req, res) => {
    const { paymentId } = req.params;
    const userId = req.user.id;

    try {
        const payment = await prisma.payment.findFirst({
            where: {
                id: parseInt(paymentId),
                user_id: userId
            }
        });

        if (!payment) {
            return res.status(404).json({ error: 'Payment not found' });
        }

        // Create refund in Stripe
        const refund = await stripe.refunds.create({
            payment_intent: payment.stripe_payment_id
        });

        // Update database
        await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'refunded' }
        });

        res.json({
            success: true,
            refund,
            message: 'Refund processed'
        });
    } catch (error) {
        console.error('Refund error:', error);
        res.status(500).json({ error: 'Failed to process refund' });
    }
};

// Get publishable key
exports.getPublishableKey = async (req, res) => {
    res.json({
        publishableKey: process.env.STRIPE_PUBLISHABLE_KEY
    });
};
