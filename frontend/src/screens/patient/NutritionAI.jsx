import React, { useState } from 'react';
import { Camera, Scan, Check } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const NutritionAI = () => {
    const [scanning, setScanning] = useState(false);
    const [result, setResult] = useState(null);

    const handleScan = () => {
        setScanning(true);
        setTimeout(() => {
            setScanning(false);
            setResult({
                food: "Jollof Rice & Chicken",
                calories: "450 kcal",
                nutrients: {
                    protein: "25g",
                    carbs: "60g",
                    fat: "12g"
                },
                advice: "Good source of energy. Consider adding more vegetables like steamed spinach or salad for fiber."
            });
        }, 2500);
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)]">
            <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">Nutrition AI</h2>
                <p className="text-sm text-gray-500">Scan your food for instant analysis</p>
            </div>

            <div className="flex-1 flex flex-col gap-4">
                {/* Camera Viewfinder Placeholder */}
                <div className="flex-1 bg-gray-900 rounded-2xl relative overflow-hidden flex items-center justify-center">
                    {!result && !scanning && (
                        <div className="text-center text-white p-6">
                            <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg font-medium mb-2">Point camera at food</p>
                            <Button onClick={handleScan} className="bg-white text-gray-900 hover:bg-gray-100">
                                <Scan className="w-4 h-4 mr-2" /> Scan Now
                            </Button>
                        </div>
                    )}

                    {scanning && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                            <div className="text-center text-white">
                                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                <p>Analyzing food...</p>
                            </div>
                        </div>
                    )}

                    {result && (
                        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(https://source.unsplash.com/random/800x600/?jollof)' }}>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                <div className="flex justify-between items-end mb-4">
                                    <div>
                                        <h3 className="text-2xl font-bold">{result.food}</h3>
                                        <p className="text-primary font-medium">{result.calories}</p>
                                    </div>
                                    <Button size="sm" onClick={() => setResult(null)} variant="outline" className="text-white border-white hover:bg-white/20">
                                        Scan Again
                                    </Button>
                                </div>

                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    <div className="bg-white/10 rounded-lg p-2 text-center backdrop-blur-md">
                                        <p className="text-xs opacity-70">Protein</p>
                                        <p className="font-bold">{result.nutrients.protein}</p>
                                    </div>
                                    <div className="bg-white/10 rounded-lg p-2 text-center backdrop-blur-md">
                                        <p className="text-xs opacity-70">Carbs</p>
                                        <p className="font-bold">{result.nutrients.carbs}</p>
                                    </div>
                                    <div className="bg-white/10 rounded-lg p-2 text-center backdrop-blur-md">
                                        <p className="text-xs opacity-70">Fat</p>
                                        <p className="font-bold">{result.nutrients.fat}</p>
                                    </div>
                                </div>

                                <div className="bg-primary/20 border border-primary/30 rounded-lg p-3 backdrop-blur-md">
                                    <p className="text-sm">💡 {result.advice}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NutritionAI;
