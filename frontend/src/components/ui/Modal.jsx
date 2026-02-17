import React from 'react';
import { X } from 'lucide-react';
import Card from './Card';
import Button from './Button';

const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <Card className="w-full max-w-lg mx-auto p-0 overflow-hidden shadow-2xl scale-100 opacity-100">
                <div className="flex justify-between items-center p-6 border-b border-[var(--color-border)] bg-gray-50">
                    <h2 className="text-xl font-bold text-[var(--color-primary)]">
                        {title}
                    </h2>
                    <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                        <X className="w-5 h-5" />
                    </Button>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </Card>
        </div>
    );
};

export default Modal;
