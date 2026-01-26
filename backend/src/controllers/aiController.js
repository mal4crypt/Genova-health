const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENAI_KEY || '');

// Symptom Triage
exports.checkSymptoms = async (req, res) => {
    const { symptoms } = req.body;

    if (!symptoms || !symptoms.trim()) {
        return res.status(400).json({ error: 'Symptoms are required' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `You are a medical AI assistant. A patient describes these symptoms: "${symptoms}". 
        
Provide:
1. Risk Assessment (Low/Medium/High)
2. Possible Conditions (top 3 most likely)
3. Recommended Actions
4. When to seek emergency care

Be professional, empathetic, and include a disclaimer that this is not a diagnosis.

Format response as JSON:
{
  "riskLevel": "low|medium|high",
  "possibleConditions": ["condition1", "condition2", "condition3"],
  "recommendation": "detailed recommendation",
  "emergencySigns": ["sign1", "sign2"],
  "disclaimer": "disclaimer text"
}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse JSON from response
        try {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const analysis = JSON.parse(jsonMatch[0]);
                res.json(analysis);
            } else {
                // Fallback if JSON parsing fails
                res.json({
                    riskLevel: 'medium',
                    possibleConditions: ['Requires professional evaluation'],
                    recommendation: text,
                    emergencySigns: ['Severe pain', 'Difficulty breathing', 'Chest pain'],
                    disclaimer: 'This is not a medical diagnosis. Please consult a healthcare professional.'
                });
            }
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            res.json({
                riskLevel: 'medium',
                possibleConditions: ['Requires professional evaluation'],
                recommendation: text,
                emergencySigns: ['Severe pain', 'Difficulty breathing', 'Chest pain'],
                disclaimer: 'This is not a medical diagnosis. Please consult a healthcare professional.'
            });
        }
    } catch (error) {
        console.error('AI symptom check error:', error);
        res.status(500).json({
            error: 'AI service unavailable',
            fallback: {
                riskLevel: 'medium',
                recommendation: 'Please consult a healthcare professional for proper diagnosis.',
                disclaimer: 'This is not a medical diagnosis.'
            }
        });
    }
};

// Mental Health Chatbot
exports.mentalHealthChat = async (req, res) => {
    const { message, conversationHistory = [] } = req.body;

    if (!message || !message.trim()) {
        return res.status(400).json({ error: 'Message is required' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        // Build conversation context
        let context = `You are a compassionate mental health AI companion named "Genova Care Assistant". 
        
Your role:
- Provide emotional support
- Use active listening techniques
- Suggest coping strategies
- Recognize crisis situations
- Always recommend professional help for serious issues

Previous conversation:
${conversationHistory.map(msg => `${msg.role}: ${msg.content}`).join('\n')}

User: ${message}
Assistant:`;

        const result = await model.generateContent(context);
        const response = await result.response;
        const aiResponse = response.text();

        res.json({
            response: aiResponse,
            timestamp: new Date().toISOString(),
            isCrisis: aiResponse.toLowerCase().includes('crisis') || aiResponse.toLowerCase().includes('emergency')
        });
    } catch (error) {
        console.error('Mental health chat error:', error);
        res.status(500).json({
            error: 'AI service unavailable',
            response: "I'm here to listen. While I'm currently unavailable, please remember you can reach crisis support at your local helpline."
        });
    }
};

// General Health Q&A
exports.healthQA = async (req, res) => {
    const { question } = req.body;

    if (!question || !question.trim()) {
        return res.status(400).json({ error: 'Question is required' });
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `You are a knowledgeable health information assistant. Answer this health question concisely and accurately: "${question}"
        
Include:
- Direct answer
- Key facts
- When to consult a doctor
- Medical disclaimer

Keep response under 200 words.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const answer = response.text();

        res.json({
            question,
            answer,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Health Q&A error:', error);
        res.status(500).json({ error: 'AI service unavailable' });
    }
};
