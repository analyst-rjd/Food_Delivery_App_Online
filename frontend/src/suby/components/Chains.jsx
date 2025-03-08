import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaRegArrowAltCircleRight, FaRegArrowAltCircleLeft } from "react-icons/fa";
import { API_URL, fetchWithAuth } from '../api';
import { restaurantData as localRestaurantData } from '../data/restaurants';
import ImageWithFallback from '../../components/common/ImageWithFallback';

const Chains = () => {
    const scrollContainerRef = useRef(null);
    // Always start with local data
    const [restaurantData, setRestaurantData] = useState(localRestaurantData);
    const [isLoading, setIsLoading] = useState(true);
    const [apiRestaurants, setApiRestaurants] = useState([]);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                setIsLoading(true);
                // Start with local data
                console.log('Chains: Using local restaurant data initially');
                
                // Try to fetch from API but don't replace local data if it fails
                try {
                    console.log('Chains: Fetching restaurants from:', `${API_URL}/api/restaurants`);
                    
                    // Use the new fetchWithAuth helper or fetch with CORS options
                    const data = await fetchWithAuth('/api/restaurants')
                        .catch(async () => {
                            // Fallback to regular fetch with specific CORS options if fetchWithAuth fails
                            const response = await fetch(`${API_URL}/api/restaurants`, {
                                method: 'GET',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                credentials: 'include',
                                mode: 'cors'
                            });
                            
                            if (!response.ok) {
                                throw new Error('Network response was not ok');
                            }
                            
                            return await response.json();
                        });
                    console.log('Chains: API returned restaurants:', data);
                    
                    // Store API restaurants separately
                    setApiRestaurants(data);
                    
                    // Only update if we got valid data
                    if (data && Array.isArray(data) && data.length > 0) {
                        // Transform backend data to match frontend expected structure
                        const transformedData = {
                            vendors: data.map(restaurant => ({
                                _id: restaurant._id,
                                mongoId: restaurant._id, // Store the MongoDB ID separately
                                numericId: restaurant.numericId || restaurant.legacyId,
                                firm: [{
                                    _id: restaurant._id,
                                    firmName: restaurant.name || 'Restaurant',
                                    image: restaurant.mainImage || restaurant.images?.[0] || null,
                                }]
                            }))
                        };
                        
                        // Create a map of existing vendor IDs for faster lookup
                        const existingVendorIds = new Set(
                            localRestaurantData.vendors.map(vendor => vendor._id)
                        );
                        
                        // Merge with local data to ensure all restaurants are shown
                        // Only add API restaurants that don't exist in local data
                        const mergedData = {
                            vendors: [
                                ...localRestaurantData.vendors,
                                ...transformedData.vendors.filter(apiVendor => 
                                    !existingVendorIds.has(apiVendor._id) && 
                                    !existingVendorIds.has(apiVendor.numericId) &&
                                    !existingVendorIds.has(apiVendor.legacyId)
                                )
                            ]
                        };
                        
                        setRestaurantData(mergedData);
                        console.log('Chains: Merged restaurant data:', mergedData);
                    }
                } catch (apiError) {
                    console.error("Chains: Failed to fetch from API:", apiError);
                    // Already using local data, no need to do anything here
                }
            } catch (error) {
                console.error("Chains: Critical error:", error);
                // Ensure we're using local data
                setRestaurantData(localRestaurantData);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRestaurants();
    }, []);

    const handleScroll = (direction) => {
        if (scrollContainerRef.current) {
            const container = scrollContainerRef.current;
            const scrollAmount = 300;
            const newScrollPosition = direction === "left" 
                ? container.scrollLeft - scrollAmount 
                : container.scrollLeft + scrollAmount;
            
            container.scrollTo({
                left: newScrollPosition,
                behavior: "smooth"
            });
        }
    };

    return (
        <div className='mediaChainSection'>
            <h3 className='chainTitle'>Top restaurant chains in Hyderabad</h3>
            <section className="chainSection">
                <div className="btnSection">
                    <button onClick={() => handleScroll("left")}>
                        <FaRegArrowAltCircleLeft className='btnIcons' />
                    </button>
                    <button onClick={() => handleScroll("right")}>
                        <FaRegArrowAltCircleRight className='btnIcons' />
                    </button>
                </div>
                {isLoading ? (
                    <div className="loading">Loading restaurants...</div>
                ) : (
                    <div 
                        className="chainWrapper" 
                        ref={scrollContainerRef}
                    >
                        {(restaurantData.vendors || []).map((vendor) => (
                            <div className="vendorBox" key={vendor._id || vendor.mongoId}>
                                {(vendor.firm || []).map((item) => (
                                    <Link 
                                        to={`/products/${vendor.mongoId || vendor._id}/${encodeURIComponent(item.firmName)}`}
                                        className="link" 
                                        key={item._id}
                                    >
                                        <div className="firmImage">
                                            <ImageWithFallback 
                                                src={item.image}
                                                alt={item.firmName}
                                                fallbackType="restaurant"
                                            />
                                            <div className="firmName">{item.firmName}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Chains;