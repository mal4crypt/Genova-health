import React, { useState } from 'react';

const Tabs = ({ tabs, defaultTab = 0 }) => {
    const [activeTab, setActiveTab] = useState(defaultTab);

    return (
        <div className="w-full">
            {/* Tab Headers */}
            <div className="border-b border-gray-200">
                <nav className="flex space-x-8">
                    {tabs.map((tab, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveTab(index)}
                            className={`
                                py-4 px-1 border-b-2 font-medium text-sm transition-colors
                                ${activeTab === index
                                    ? 'border-primary text-primary'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }
                            `}
                        >
                            {tab.label}
                            {tab.count !== undefined && (
                                <span className={`ml-2 py-0.5 px-2.5 rounded-full text-xs ${activeTab === index
                                        ? 'bg-primary-light text-primary'
                                        : 'bg-gray-100 text-gray-600'
                                    }`}>
                                    {tab.count}
                                </span>
                            )}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Tab Content */}
            <div className="mt-6">
                {tabs[activeTab]?.content}
            </div>
        </div>
    );
};

export default Tabs;
