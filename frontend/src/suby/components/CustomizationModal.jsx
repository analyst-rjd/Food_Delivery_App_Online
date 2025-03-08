import React, { useState } from 'react';
import { FaPepperHot, FaLeaf, FaCircle } from 'react-icons/fa';

const CustomizationModal = ({ item, onClose, onSave }) => {
    const [spiceLevel, setSpiceLevel] = useState(2);
    const [preferences, setPreferences] = useState([]);
    const [specialInstructions, setSpecialInstructions] = useState('');

    const spiceLevels = [
        { level: 1, label: 'Mild' },
        { level: 2, label: 'Medium' },
        { level: 3, label: 'Spicy' },
        { level: 4, label: 'Extra Spicy' }
    ];

    const preferenceOptions = [
        { id: 'veg', label: 'Make it Veg', icon: <FaLeaf /> },
        { id: 'extra-gravy', label: 'Extra Gravy', icon: <FaCircle /> },
        { id: 'no-onion', label: 'No Onion/Garlic', icon: <FaCircle /> }
    ];

    return (
        <div className="customization-modal">
            <div className="modal-content">
                <h3>Customize {item.name}</h3>
                
                <div className="spice-selector">
                    <h4>Spice Level</h4>
                    <div className="spice-levels">
                        {spiceLevels.map(({ level, label }) => (
                            <button
                                key={level}
                                className={`spice-btn ${spiceLevel === level ? 'active' : ''}`}
                                onClick={() => setSpiceLevel(level)}
                            >
                                {[...Array(level)].map((_, i) => (
                                    <FaPepperHot key={i} className="pepper-icon" />
                                ))}
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="preferences">
                    <h4>Preferences</h4>
                    <div className="preference-options">
                        {preferenceOptions.map(({ id, label, icon }) => (
                            <label key={id} className="preference-option">
                                <input
                                    type="checkbox"
                                    checked={preferences.includes(id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setPreferences([...preferences, id]);
                                        } else {
                                            setPreferences(preferences.filter(p => p !== id));
                                        }
                                    }}
                                />
                                {icon}
                                <span>{label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div className="special-instructions">
                    <h4>Special Instructions</h4>
                    <textarea
                        value={specialInstructions}
                        onChange={(e) => setSpecialInstructions(e.target.value)}
                        placeholder="Any special requests?"
                        maxLength={200}
                    />
                </div>

                <div className="modal-actions">
                    <button onClick={onClose} className="cancel-btn">Cancel</button>
                    <button 
                        onClick={() => onSave({ spiceLevel, preferences, specialInstructions })}
                        className="save-btn"
                    >
                        Save & Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CustomizationModal; 