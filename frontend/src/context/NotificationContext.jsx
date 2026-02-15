import React, { createContext, useContext, useState, useCallback } from 'react';

const NotificationContext = createContext();

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const showNotification = useCallback((message, type = 'info', duration = 5000) => {
        const id = Date.now();
        setNotifications((prev) => [...prev, { id, message, type, duration }]);

        if (duration > 0) {
            setTimeout(() => {
                removeNotification(id);
            }, duration);
        }
    }, []);

    const removeNotification = useCallback((id) => {
        setNotifications((prev) => prev.filter((notification) => notification.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
                {notifications.map((notification) => (
                    <div
                        key={notification.id}
                        className={`pointer-events-auto flex items-center justify-between p-4 rounded-lg shadow-lg min-w-[300px] transform transition-all duration-300 ease-in-out translate-y-0 opacity-100 ${notification.type === 'error' ? 'bg-red-50 text-red-800 border-l-4 border-red-500' :
                                notification.type === 'success' ? 'bg-green-50 text-green-800 border-l-4 border-green-500' :
                                    'bg-blue-50 text-blue-800 border-l-4 border-blue-500'
                            }`}
                        role="alert"
                    >
                        <div className="flex items-center">
                            {notification.type === 'error' && (
                                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            )}
                            {notification.type === 'success' && (
                                <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                            )}
                            <span className="font-medium text-sm">{notification.message}</span>
                        </div>
                        <button
                            onClick={() => removeNotification(notification.id)}
                            className="ml-4 text-gray-400 hover:text-gray-900 focus:outline-none"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};
