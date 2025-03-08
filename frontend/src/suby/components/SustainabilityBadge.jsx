import React from 'react';
import { FaLeaf, FaRecycle, FaApple, FaSeedling, FaWater, FaSun } from 'react-icons/fa';
import { MdEnergySavingsLeaf } from "react-icons/md";

const SustainabilityBadge = ({ metrics }) => {
    // Add console.log to debug
    console.log("Sustainability Metrics:", metrics);

    const badges = [
        {
            id: 'localSourcing',
            icon: <FaApple />,
            title: 'Local Ingredients',
            description: 'Sources ingredients from local farmers'
        },
        {
            id: 'recyclablePackaging',
            icon: <FaRecycle />,
            title: 'Eco Packaging',
            description: 'Uses 100% recyclable packaging'
        },
        {
            id: 'lowWaste',
            icon: <FaLeaf />,
            title: 'Low Waste',
            description: 'Implements food waste reduction practices'
        },
        {
            id: 'organicCertified',
            icon: <FaSeedling />,
            title: 'Organic Certified',
            description: 'Uses certified organic ingredients'
        },
        {
            id: 'waterConservation',
            icon: <FaWater />,
            title: 'Water Smart',
            description: 'Practices water conservation'
        },
        {
            id: 'solarPowered',
            icon: <FaSun />,
            title: 'Solar Powered',
            description: 'Uses renewable solar energy'
        },
        {
            id: 'energyEfficient',
            icon: <MdEnergySavingsLeaf />,
            title: 'Energy Efficient',
            description: 'Uses energy-efficient equipment'
        }
    ];

    // Add a check to ensure metrics exist
    if (!metrics) {
        console.log("No metrics provided");
        return null;
    }

    return (
        <div className="sustainability-badges">
            {badges.map(badge => (
                metrics[badge.id] && (
                    <div 
                        key={badge.id} 
                        className="eco-badge" 
                        title={`${badge.title}: ${badge.description}`}
                    >
                        {badge.icon}
                        <span className="badge-tooltip">
                            <strong>{badge.title}</strong>
                            <p>{badge.description}</p>
                        </span>
                    </div>
                )
            ))}
        </div>
    );
};

export default SustainabilityBadge; 