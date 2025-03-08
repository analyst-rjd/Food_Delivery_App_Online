import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_URL } from '../api';
import { restaurantData as localRestaurantData } from '../data/restaurants';
import ImageWithFallback from '../../components/common/ImageWithFallback';

const FirmCollections = () => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    // Always start with local data
    const [restaurantData, setRestaurantData] = useState(localRestaurantData);
    const [isLoading, setIsLoading] = useState(true);
    const [apiRestaurants, setApiRestaurants] = useState([]);

    useEffect(() => {
        const fetchRestaurants = async () => {
            try {
                setIsLoading(true);
                // Start with local data
                console.log('FirmCollections: Using local restaurant data initially');
                
                // Try to fetch from API but don't replace local data if it fails
                try {
                    console.log('FirmCollections: Fetching restaurants from:', `${API_URL}/api/restaurants`);
                    
                    const response = await fetch(`${API_URL}/api/restaurants`);
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    
                    const data = await response.json();
                    console.log('FirmCollections: API returned restaurants:', data);
                    
                    // Store API restaurants separately
                    setApiRestaurants(data);
                    
                    // Only update if we got valid data
                    if (data && Array.isArray(data) && data.length > 0) {
                        // Transform backend data to match frontend expected structure
                        const transformedData = {
                            vendors: data.map(restaurant => ({
                                _id: restaurant._id,
                                mongoId: restaurant._id, // Store the MongoDB ID separately
                                firm: [{
                                    _id: restaurant._id,
                                    firmName: restaurant.name || 'Restaurant',
                                    categories: restaurant.categories || [],
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
                        console.log('FirmCollections: Merged restaurant data:', mergedData);
                    }
                } catch (apiError) {
                    console.error("FirmCollections: Failed to fetch from API:", apiError);
                    // Already using local data, no need to do anything here
                }
            } catch (error) {
                console.error("FirmCollections: Critical error:", error);
                // Ensure we're using local data
                setRestaurantData(localRestaurantData);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRestaurants();
    }, []);

    // Get unique categories from all vendors
    const categories = ['all', ...new Set((restaurantData.vendors || []).flatMap(
        vendor => (vendor.firm || []).flatMap(item => item.categories || [])
    ))];

    // Filter vendors based on selected category
    const filteredVendors = (restaurantData.vendors || []).map(vendor => ({
        ...vendor,
        firm: (vendor.firm || []).filter(item => 
            selectedCategory === 'all' || 
            (item.categories && item.categories.includes(selectedCategory))
        )
    })).filter(vendor => vendor.firm && vendor.firm.length > 0);

    return (
        <div className='mediaSection'>
            <h3 className='collectionTitle'>Order from these collections</h3>
            
            <div className="categoryFilter">
                {categories.map(category => (
                    <button
                        key={category}
                        className={selectedCategory === category ? 'active' : ''}
                        onClick={() => setSelectedCategory(category)}
                    >
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                    </button>
                ))}
            </div>

            {isLoading ? (
                <div className="loading">Loading restaurants...</div>
            ) : (
                <section className="collectionSection">
                    <div className="collectionWrapper">
                        {(filteredVendors || []).map((vendor) => (
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
                </section>
            )}

            {!isLoading && filteredVendors.length === 0 && (
                <div className="no-restaurants-message">
                    No restaurants found in this category
                </div>
            )}
        </div>
    );
};

export default FirmCollections;