import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Heart, MessageCircle, AlertCircle } from 'lucide-react';
import Button from '../../components/ui/Button';

const WelcomeScreen = () => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        {
            id: 1,
            title: "Your health, simplified.",
            description: "Fast health guidance & support for Nigerians.",
            icon: <Heart className="w-16 h-16 text-primary" />,
            color: "bg-green-50"
        },
        {
            id: 2,
            title: "Chat in English or Pidgin.",
            description: "Safe AI guidance whenever you need it.",
            icon: <MessageCircle className="w-16 h-16 text-secondary" />,
            color: "bg-blue-50"
        },
        {
            id: 3,
            title: "Emergency access in seconds.",
            description: "Get help quickly when it matters most.",
            icon: <AlertCircle className="w-16 h-16 text-error" />,
            color: "bg-red-50"
        }
    ];

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        } else {
            navigate('/role-select');
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <div className={`flex-1 flex flex-col items-center justify-center p-6 transition-colors duration-500 ${slides[currentSlide].color}`}>
                <div className="mb-8 p-6 rounded-full bg-white shadow-lg animate-bounce-slow">
                    {slides[currentSlide].icon}
                </div>

                <h1 className="text-3xl font-bold text-center text-gray-900 mb-4 transition-all duration-300">
                    {slides[currentSlide].title}
                </h1>

                <p className="text-lg text-center text-gray-600 mb-12 max-w-xs transition-all duration-300">
                    {slides[currentSlide].description}
                </p>

                <div className="flex gap-2 mb-12">
                    {slides.map((_, index) => (
                        <div
                            key={index}
                            className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-primary' : 'w-2 bg-gray-300'
                                }`}
                        />
                    ))}
                </div>
            </div>

            <div className="p-6 bg-white border-t border-gray-100">
                <Button
                    onClick={handleNext}
                    className="w-full flex items-center justify-center gap-2"
                    size="lg"
                >
                    {currentSlide === slides.length - 1 ? 'Get Started' : 'Next'}
                    <ChevronRight className="w-5 h-5" />
                </Button>
            </div>
        </div>
    );
};

export default WelcomeScreen;
