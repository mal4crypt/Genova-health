import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import { useNavigate } from 'react-router-dom';

const SymptomChecker = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState('input'); // input, analyzing, result
    const [symptoms, setSymptoms] = useState('');
    const [result, setResult] = useState(null);

    const handleCheck = () => {
        if (!symptoms.trim()) return;
        setStep('analyzing');

        // Mock Analysis Logic
        setTimeout(() => {
            const lowerSymptoms = symptoms.toLowerCase();
            let riskLevel = 'low';
            let recommendation = 'Rest and hydration recommended.';

            if (lowerSymptoms.includes('chest pain') || lowerSymptoms.includes('difficulty breathing') || lowerSymptoms.includes('faint')) {
                riskLevel = 'high';
                recommendation = 'Immediate medical attention required.';
            } else if (lowerSymptoms.includes('fever') || lowerSymptoms.includes('vomiting') || lowerSymptoms.includes('pain')) {
                riskLevel = 'medium';
                recommendation = 'Consult a doctor for proper diagnosis.';
            }

            setResult({ riskLevel, recommendation });
            setStep('result');
        }, 2000);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Symptom Checker</h2>
                <p className="text-sm text-gray-500">AI-powered preliminary assessment</p>
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
                            Check Symptoms
                        </Button>
                    </div>
                )}

                {step === 'analyzing' && (
                    <div className="py-12 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Analyzing symptoms...</h3>
                        <p className="text-gray-500">Consulting medical database</p>
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
