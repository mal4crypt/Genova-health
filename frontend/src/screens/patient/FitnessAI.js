import React from 'react';
import { Play, Clock, Flame } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const FitnessAI = () => {
    const workouts = [
        { id: 1, title: "Morning Yoga Stretch", duration: "15 min", calories: "80 kcal", level: "Beginner", image: "https://images.unsplash.com/photo-1544367563-12123d8965cd?w=500&q=80" },
        { id: 2, title: "HIIT Cardio Blast", duration: "20 min", calories: "250 kcal", level: "Intermediate", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80" },
        { id: 3, title: "Core Strength", duration: "10 min", calories: "100 kcal", level: "Beginner", image: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&q=80" },
    ];

    return (
        <div className="pb-20">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-gray-900">Fitness AI</h2>
                <p className="text-sm text-gray-500">Personalized workouts for you</p>
            </div>

            <div className="space-y-4">
                {workouts.map((workout) => (
                    <Card key={workout.id} className="p-0 overflow-hidden group cursor-pointer">
                        <div className="relative h-48">
                            <img src={workout.image} alt={workout.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                                <div className="w-full">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <span className="text-xs font-bold text-primary bg-white/90 px-2 py-1 rounded mb-2 inline-block">{workout.level}</span>
                                            <h3 className="text-xl font-bold text-white">{workout.title}</h3>
                                        </div>
                                        <Button size="sm" className="rounded-full w-10 h-10 p-0 flex items-center justify-center bg-white text-primary hover:bg-gray-100">
                                            <Play className="w-5 h-5 ml-1" />
                                        </Button>
                                    </div>
                                    <div className="flex gap-4 mt-2 text-white/80 text-sm">
                                        <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {workout.duration}</span>
                                        <span className="flex items-center gap-1"><Flame className="w-4 h-4" /> {workout.calories}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default FitnessAI;
