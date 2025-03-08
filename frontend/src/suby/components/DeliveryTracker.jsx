import React, { useState, useEffect } from 'react';
import { FaMotorcycle, FaStore, FaHome, FaCheckCircle } from 'react-icons/fa';

const DeliveryTracker = ({ orderId }) => {
    const [progress, setProgress] = useState(0);
    const [status, setStatus] = useState('preparing');

    const stages = [
        { id: 'preparing', icon: <FaStore />, label: 'Preparing' },
        { id: 'onway', icon: <FaMotorcycle />, label: 'On the Way' },
        { id: 'delivered', icon: <FaHome />, label: 'Delivered' }
    ];

    useEffect(() => {
        // Simulate delivery progress
        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(interval);
                    return 100;
                }
                return prev + 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (progress < 33) setStatus('preparing');
        else if (progress < 66) setStatus('onway');
        else setStatus('delivered');
    }, [progress]);

    return (
        <div className="delivery-tracker">
            <div className="progress-bar">
                <div 
                    className="progress-fill"
                    style={{ width: `${progress}%` }}
                />
            </div>
            
            <div className="stages">
                {stages.map((stage, index) => (
                    <div 
                        key={stage.id} 
                        className={`stage ${status === stage.id ? 'active' : ''} 
                                  ${progress >= ((index + 1) * 33) ? 'completed' : ''}`}
                    >
                        <div className="stage-icon">
                            {progress >= ((index + 1) * 33) ? <FaCheckCircle /> : stage.icon}
                        </div>
                        <span className="stage-label">{stage.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default DeliveryTracker; 