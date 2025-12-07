import React from 'react';
import { Search, ShoppingCart, Plus } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const OrderDrugs = () => {
    const drugs = [
        { id: 1, name: "Paracetamol 500mg", price: "₦500", type: "Pain Relief", image: "https://placehold.co/100x100/e2e8f0/64748b?text=P" },
        { id: 2, name: "Vitamin C 1000mg", price: "₦1,200", type: "Supplements", image: "https://placehold.co/100x100/e2e8f0/64748b?text=V" },
        { id: 3, name: "Amoxicillin 500mg", price: "₦2,500", type: "Antibiotics", image: "https://placehold.co/100x100/e2e8f0/64748b?text=A", reqPrescription: true },
        { id: 4, name: "Cough Syrup", price: "₦1,500", type: "Cold & Flu", image: "https://placehold.co/100x100/e2e8f0/64748b?text=C" },
    ];

    return (
        <div className="pb-20">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Pharmacy</h2>
                    <p className="text-sm text-gray-500">Order medications to your door</p>
                </div>
                <Button variant="outline" size="sm" className="relative">
                    <ShoppingCart className="w-5 h-5" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">2</span>
                </Button>
            </div>

            <div className="mb-6 relative">
                <Input placeholder="Search for drugs..." className="pl-10" />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-9" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                {drugs.map((drug) => (
                    <Card key={drug.id} className="p-3 flex flex-col gap-2">
                        <div className="aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden">
                            <img src={drug.image} alt={drug.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                            {drug.reqPrescription && (
                                <span className="text-[10px] font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded mb-1 inline-block">Rx Required</span>
                            )}
                            <h3 className="font-bold text-gray-900 text-sm truncate">{drug.name}</h3>
                            <p className="text-xs text-gray-500">{drug.type}</p>
                        </div>
                        <div className="flex items-center justify-between mt-auto pt-2">
                            <span className="font-bold text-primary">{drug.price}</span>
                            <button className="w-8 h-8 rounded-full bg-gray-100 hover:bg-primary hover:text-white flex items-center justify-center transition-colors">
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="mt-8 p-4 bg-blue-50 rounded-xl flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-blue-900">Upload Prescription</h3>
                    <p className="text-sm text-blue-700">Have a doctor's note?</p>
                </div>
                <Button>Upload</Button>
            </div>
        </div>
    );
};

export default OrderDrugs;
