import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, ArrowRight, Sparkles } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useNavigate } from 'react-router-dom';

const SymptomChecker = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('input'); // input, analyzing, result
    const [symptoms, setSymptoms] = useState('');
    const [result, setResult] = useState(null);

    const handleCheck = async () => {
        if (!symptoms.trim()) return;
        setStep('analyzing');

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/ai/symptoms/check`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ symptoms })
            });

            const data = await response.json();

            if (data.error) {
                // Fallback to basic logic if AI fails
                setResult({
                    riskLevel: 'medium',
                    possibleConditions: ['Requires professional evaluation'],
                    recommendation: 'Please consult a healthcare professional for proper diagnosis.',
                    emergencySigns: ['Severe pain', 'Difficulty breathing', 'Chest pain'],
                    disclaimer: 'AI service is currently unavailable. Please consult a healthcare provider.'
                });
            } else {
                setResult(data);
            }

            setStep('result');
        } catch (error) {
            console.error('Symptom check failed:', error);
            // Fallback
            setResult({
                riskLevel: 'medium',
                possibleConditions: ['Unable to analyze'],
                recommendation: 'Please consult a healthcare professional.',
                emergencySigns: [],
                disclaimer: 'Connection error. Please try again or contact support.'
            });
            setStep('result');
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-primary" />
                    AI Symptom Checker
                </h2>
                <p className="text-sm text-gray-500">Powered by Google Gemini AI</p>
            </div>

            <Card>
                {step === 'input' && (
                    <div className="space-y-4">
                        <p className="text-gray-700">Describe what you are feeling in detail:</p>
                        <textarea
                            className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                            placeholder="e.g., I have a headache and mild fever since yesterday..."
                            value={symptoms}
                            onChange={(e) => setSymptoms(e.target.value)}
                        />
                        <Button onClick={handleCheck} className="w-full" disabled={!symptoms.trim()}>
                            Analyze Symptoms with AI
                        </Button>
                    </div>
                )}

                {step === 'analyzing' && (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">AI is analyzing your symptoms...</h3>
                        <p className="text-gray-500">Consulting medical knowledge base</p>
                    </div>
                )}

                {step === 'result' && result && (
                    <div className="space-y-6">
                        <div className={`p-4 rounded-lg flex items-start gap-3 ${result.riskLevel === 'high' ? 'bg-red-50 text-red-800' :
                            result.riskLevel === 'medium' ? 'bg-yellow-50 text-yellow-800' :
                                'bg-green-50 text-green-800'
                            }`}>
                            {result.riskLevel === 'high' ? <AlertTriangle className="w-6 h-6 shrink-0" /> :
                                result.riskLevel === 'medium' ? <AlertTriangle className="w-6 h-6 shrink-0" /> :
                                    <CheckCircle className="w-6 h-6 shrink-0" />}
                            <div>
                                <h3 className="font-bold uppercase mb-1">{result.riskLevel} Risk Detected</h3>
                                <p>{result.recommendation}</p>
                            </div>
                        </div>

                        {result.possibleConditions && result.possibleConditions.length > 0 && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-bold text-sm text-gray-700 mb-2">Possible Conditions:</h4>
                                <ul className="list-disc list-inside space-y-1">
                                    {result.possibleConditions.map((condition, idx) => (
                                        <li key={idx} className="text-sm text-gray-600">{condition}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {result.emergencySigns && result.emergencySigns.length > 0 && (
                            <div className="bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                                <h4 className="font-bold text-sm text-red-800 mb-2">⚠️ Seek Emergency Care If:</h4>
                                <ul className="list-disc list-inside space-y-1">
                                    {result.emergencySigns.map((sign, idx) => (
                                        <li key={idx} className="text-sm text-red-700">{sign}</li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="space-y-3">
                            <h4 className="font-medium text-gray-900">Recommended Actions:</h4>

                            {result.riskLevel === 'high' && (
                                <Button
                                    variant="danger"
                                    className="w-full justify-between"
                                    onClick={() => navigate('/patient/emergency')}
                                >
                                    Request Emergency Help <ArrowRight className="w-4 h-4" />
                                </Button>
                            )}

                            {(result.riskLevel === 'high' || result.riskLevel === 'medium') && (
                                <Button
                                    variant="primary"
                                    className="w-full justify-between"
                                    onClick={() => navigate('/patient/book-doctor')}
                                >
                                    Book a Doctor <ArrowRight className="w-4 h-4" />
                                </Button>
                            )}

                            {result.riskLevel === 'low' && (
                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate('/patient/nutrition')}
                                    >
                                        Nutrition Advice
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => navigate('/patient/fitness')}
                                    >
                                        Fitness Tips
                                    </Button>
                                </div>
                            )}
                        </div>

                        {result.disclaimer && (
                            <p className="text-xs text-gray-500 italic border-t pt-4">{result.disclaimer}</p>
                        )}

                        <button
                            onClick={() => { setStep('input'); setSymptoms(''); }}
                            className="text-sm text-gray-500 hover:text-primary w-full text-center mt-4"
                        >
                            Check another symptom
                        </button>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default SymptomChecker;
