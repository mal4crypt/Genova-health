import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function BottomNavigation({ items }) {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-4 w-full max-w-lg lg:max-w-2xl">
            <nav className="bg-card/80 backdrop-blur-2xl border border-border/50 rounded-[2.5rem] p-2 flex items-center justify-around shadow-2xl shadow-primary/10">
                {items.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                "relative flex flex-col items-center justify-center py-3 px-5 rounded-3xl transition-all duration-300 group",
                                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <AnimatePresence>
                                {isActive && (
                                    <motion.div
                                        layoutId="nav-active-pill"
                                        className="absolute inset-0 bg-primary/10 rounded-3xl"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ type: "spring", bounce: 0.3, duration: 0.5 }}
                                    />
                                )}
                            </AnimatePresence>

                            <div className="relative z-10 flex flex-col items-center">
                                <Icon className={cn(
                                    "w-6 h-6 transition-all duration-300 group-hover:scale-110 group-active:scale-95",
                                    isActive && "stroke-[2.5px]"
                                )} />
                                <span className={cn(
                                    "text-[10px] font-bold mt-1 transition-all duration-300 tracking-tight overflow-hidden",
                                    isActive ? "max-h-5 opacity-100" : "max-h-0 opacity-0"
                                )}>
                                    {item.label}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
}
