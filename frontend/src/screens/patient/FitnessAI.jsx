import React, { useState, useEffect } from 'react';
import { Play, Clock, Flame, Footprints, Moon, Target, Trophy, ChevronRight, Plus, Apple, Smartphone, Activity } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import fitnessService from '../../services/fitnessService';

const FitnessAI = () => {
    const [metrics, setMetrics] = useState({ steps: 0, sleep: 0 });
    const [goals, setGoals] = useState([]);
    const [achievements, setAchievements] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [goalsData, achievementsData, stepsMetrics, sleepMetrics] = await Promise.all([
                fitnessService.getGoals(),
                fitnessService.getAchievements(),
                fitnessService.getMetrics('steps', 1),
                fitnessService.getMetrics('sleep_minutes', 1)
            ]);

            setGoals(goalsData);
            setAchievements(achievementsData);

            // Calculate today's totals
            const todaySteps = stepsMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0);
            const todaySleep = sleepMetrics.reduce((sum, m) => sum + parseFloat(m.value), 0);

            setMetrics({ steps: todaySteps, sleep: todaySleep });
            setLoading(false);
        } catch (error) {
            console.error('Error fetching fitness data:', error);
            setLoading(false);
        }
    };

    const workouts = [
        { id: 1, title: "Morning Yoga Stretch", duration: "15 min", calories: "80 kcal", level: "Beginner", image: "https://images.unsplash.com/photo-1544337585-712f73f48c9c?w=500&q=80" },
        { id: 2, title: "HIIT Cardio Blast", duration: "20 min", calories: "250 kcal", level: "Intermediate", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80" },
    ];

    return (
        <div className="pb-24 max-w-lg mx-auto p-4 animate-in fade-in duration-500">
            {/* Header */}
            <div className="mb-6 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Health & Fitness</h1>
                    <p className="text-sm text-gray-500">Track your progress and stay active</p>
                </div>
                <Button variant="ghost" size="sm" className="rounded-full bg-blue-50 text-blue-600">
                    <Plus className="w-5 h-5" />
                </Button>
            </div>

            {/* Daily Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <Card className="p-4 border-none bg-gradient-to-br from-orange-400 to-orange-500 text-white shadow-lg shadow-orange-100">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Footprints className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Today</span>
                    </div>
                    <div className="mt-4">
                        <span className="text-2xl font-black">{metrics.steps.toLocaleString()}</span>
                        <p className="text-xs text-white/80 font-medium">Steps Taken</p>
                    </div>
                    <div className="mt-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white transition-all duration-1000" style={{ width: `${Math.min((metrics.steps / 10000) * 100, 100)}%` }} />
                    </div>
                </Card>

                <Card className="p-4 border-none bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-lg shadow-indigo-100">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-white/20 rounded-lg">
                            <Moon className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Sleep</span>
                    </div>
                    <div className="mt-4">
                        <span className="text-2xl font-black">{Math.floor(metrics.sleep / 60)}h {Math.floor(metrics.sleep % 60)}m</span>
                        <p className="text-xs text-white/80 font-medium">Rest Gained</p>
                    </div>
                    <div className="mt-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white transition-all duration-1000" style={{ width: `${Math.min((metrics.sleep / 480) * 100, 100)}%` }} />
                    </div>
                </Card>
            </div>

            {/* Goal Progress */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Target className="w-5 h-5 text-primary" /> Active Goals
                    </h3>
                    <Button variant="ghost" size="sm" className="text-primary font-bold">Manage</Button>
                </div>
                <div className="space-y-3">
                    {goals.length > 0 ? goals.map(goal => (
                        <Card key={goal.id} className="p-4 bg-white border-gray-100 shadow-sm">
                            <div className="flex justify-between mb-2">
                                <span className="font-bold text-sm text-gray-800">{goal.title}</span>
                                <span className="text-xs font-bold text-primary">{Math.round((goal.current_value / goal.target_value) * 100)}%</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${Math.min((goal.current_value / goal.target_value) * 100, 100)}%` }} />
                            </div>
                        </Card>
                    )) : (
                        <Card className="p-4 bg-gray-50 border-dashed border-gray-200 text-center py-6">
                            <p className="text-sm text-gray-500 mb-3">No active goals yet</p>
                            <Button size="sm" variant="outline" className="text-xs">Set Your First Goal</Button>
                        </Card>
                    )}
                </div>
            </div>

            {/* Achievements & Levels */}
            <div className="mb-8">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                        <Trophy className="w-5 h-5 text-yellow-500" /> Achievements
                    </h3>
                    <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-bold uppercase">LVL {Math.floor(achievements.length / 3) + 1}</span>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                    {achievements.map((achievement, i) => (
                        <div key={i} className="flex-shrink-0 w-24 text-center">
                            <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-yellow-300 to-orange-400 flex items-center justify-center shadow-lg shadow-orange-100 mb-2">
                                <Trophy className="w-8 h-8 text-white" />
                            </div>
                            <p className="text-[10px] font-bold text-gray-700 leading-tight">{achievement.title}</p>
                        </div>
                    ))}
                    <div className="flex-shrink-0 w-24 text-center opacity-40 grayscale">
                        <div className="w-16 h-16 mx-auto rounded-full bg-gray-200 flex items-center justify-center border-2 border-dashed border-gray-300 mb-2">
                            <Trophy className="w-8 h-8 text-gray-400" />
                        </div>
                        <p className="text-[10px] font-bold text-gray-500">Level {Math.floor(achievements.length / 3) + 2}</p>
                    </div>
                </div>
            </div>

            {/* Fitness Integrations */}
            <div className="mb-8">
                <h3 className="font-bold text-gray-900 mb-4 px-1">Connect Devices</h3>
                <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="flex items-center justify-start gap-3 h-14 bg-white border-gray-200">
                        <Apple className="w-5 h-5 text-black" />
                        <div className="text-left">
                            <p className="text-[10px] uppercase font-black text-gray-400 leading-none">Connect</p>
                            <p className="text-sm font-bold text-gray-700">Apple Health</p>
                        </div>
                    </Button>
                    <Button variant="outline" className="flex items-center justify-start gap-3 h-14 bg-white border-gray-200">
                        <Smartphone className="w-5 h-5 text-blue-500" />
                        <div className="text-left">
                            <p className="text-[10px] uppercase font-black text-gray-400 leading-none">Connect</p>
                            <p className="text-sm font-bold text-gray-700">Google Fit</p>
                        </div>
                    </Button>
                </div>
                <Button variant="ghost" className="w-full mt-3 text-sm text-gray-500 gap-2 h-10 border border-gray-100 rounded-xl">
                    <Activity className="w-4 h-4" /> View More Integrations
                </Button>
            </div>

            {/* Recommended Workouts */}
            <div className="mb-4">
                <h3 className="font-bold text-gray-900 mb-4 px-1">Specialized Workouts</h3>
                <div className="space-y-4">
                    {workouts.map((workout) => (
                        <Card key={workout.id} className="p-0 overflow-hidden group cursor-pointer border-none shadow-md">
                            <div className="relative h-40">
                                <img src={workout.image} alt={workout.title} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-4">
                                    <div className="w-full flex justify-between items-end">
                                        <div>
                                            <span className="text-[10px] font-black text-white bg-primary px-2 py-1 rounded-full mb-2 inline-block uppercase tracking-wider">{workout.level}</span>
                                            <h3 className="text-lg font-bold text-white">{workout.title}</h3>
                                            <div className="flex gap-3 mt-1 text-white/80 text-xs font-bold">
                                                <span className="flex items-center gap-1 uppercase"><Clock className="w-3.5 h-3.5" /> {workout.duration}</span>
                                                <span className="flex items-center gap-1 uppercase"><Flame className="w-3.5 h-3.5" /> {workout.calories}</span>
                                            </div>
                                        </div>
                                        <div className="rounded-full w-10 h-10 flex items-center justify-center bg-primary text-white shadow-xl shadow-primary/40">
                                            <Play className="w-5 h-5 ml-1" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FitnessAI;

