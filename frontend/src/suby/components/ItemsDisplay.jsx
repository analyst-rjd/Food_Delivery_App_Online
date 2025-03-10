import React, { useState, useEffect } from 'react'
import { itemData } from '../data/itemData'
import { menuData } from '../data/menuData'
import { FaRegArrowAltCircleRight, FaRegArrowAltCircleLeft, FaTimes } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { API_URL } from '../api';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import './ItemsDisplay.css'; // Added for styling fixes

const ItemsDisplay = () => {
    // Initialize with local data first, then try to fetch from API
    const [displayItem, setDisplayItem] = useState(itemData)
    const [selectedItem, setSelectedItem] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchItems = async () => {
            // Already have local data loaded initially
            setLoading(true);
            setError(null);
            
            try {
                console.log('Fetching items from API:', `${API_URL}/api/items`);
                const response = await fetch(`${API_URL}/api/items`);
                
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                
                const data = await response.json();
                console.log('API returned items:', data.length);
                
                // Transform backend data to match frontend expected structure
                const transformedData = data.map(item => {
                    // Create proper image URL
                    let itemImage = item.image;
                    
                    // If image is a placeholder URL or missing, replace with Unsplash food image
                    if (!itemImage || itemImage.includes('placeholder.com')) {
                        // Use food-related Unsplash images with a fixed ID to avoid random loading
                        const foodTerms = ['food', 'dish', 'meal', 'cuisine'];
                        const searchTerm = item.category?.toLowerCase() || 'food';
                        const randomSeed = item._id ? parseInt(item._id.substring(0, 8), 16) % 1000 : Math.floor(Math.random() * 1000);
                        itemImage = `https://images.unsplash.com/photo-15${randomSeed < 100 ? '0' : ''}${randomSeed}674900247-0877df9cc836?w=300&h=300&fit=crop`;
                    }
                    
                    return {
                        id: item._id,
                        name: item.name,
                        description: item.description,
                        price: item.price,
                        item_img: itemImage,
                        category: item.category
                    };
                });
                
                // If we got data from API, merge it with local data to ensure we always have items
                if (transformedData.length > 0) {
                    console.log('Setting transformed API data:', transformedData.length, 'items');
                    setDisplayItem(prev => {
                        // Combine API items with local items, avoiding duplicates by name
                        const existingNames = new Set(transformedData.map(item => item.name.toLowerCase()));
                        const filteredLocalItems = itemData.filter(item => !existingNames.has(item.name.toLowerCase()));
                        return [...transformedData, ...filteredLocalItems];
                    });
                }
            } catch (error) {
                console.error("Failed to fetch items:", error);
                setError(error.message);
                // Already using local data by default, so no need to set it again
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    const handleScroll = (direction) => {
        const gallery = document.getElementById("itemGallery");
        const scrollAmount = 300;

        if (direction === "left") {
            gallery.scrollTo({
                left: gallery.scrollLeft - scrollAmount,
                behavior: "smooth"
            });
        } else if (direction === "right") {
            gallery.scrollTo({
                left: gallery.scrollLeft + scrollAmount,
                behavior: "smooth"
            });
        }
    }

    const findItemInRestaurants = (itemName) => {
        // Helper function to check if names are similar
        const isSimilarName = (name1, name2) => {
            const normalize = str => str.toLowerCase().replace(/\s+/g, '');
            const n1 = normalize(name1);
            const n2 = normalize(name2);
            return n1.includes(n2) || n2.includes(n1);
        };

        return Object.entries(menuData).map(([restaurantId, restaurant]) => {
            // Check each item in the restaurant's menu
            const matchingItem = restaurant.items.find(item => 
                isSimilarName(item.name, itemName) || // Check exact name
                (item.category && isSimilarName(item.category, itemName)) // Check category
            );

            if (matchingItem) {
                return {
                    restaurantId,
                    restaurantName: restaurant.name,
                    item: matchingItem
                };
            }
            return null;
        }).filter(Boolean); // Remove null entries
    }

    return (
        <div className="itemSectionContainer">
            <h3>Popular Dishes</h3>
            <div className="itemBtnSection">
                <button onClick={() => handleScroll("left")}>
                    <FaRegArrowAltCircleLeft className='btnIcons' />
                </button>
                <button onClick={() => handleScroll("right")}>
                    <FaRegArrowAltCircleRight className='btnIcons' />
                </button>
            </div>
            <div className="itemSection" id="itemGallery">
                {loading && <div className="loading-indicator">Loading dishes...</div>}
                {error && <div className="error-message">Error: {error}</div>}
                
                <div className="itemWrapper">
                    {displayItem && displayItem.length > 0 ? displayItem.map((item) => (
                        <div 
                            className="gallery" 
                            key={item.id || `item-${Math.random()}`}
                            onClick={() => setSelectedItem(item)}
                        >
                            <ImageWithFallback 
                                src={item.item_img} 
                                alt={item.name} 
                                fallbackType="item" 
                            />
                            <p className="item-name">{item.name}</p>
                        </div>
                    )) : (
                        !loading && <div className="no-items">No dishes available</div>
                    )}
                </div>
            </div>

            {selectedItem && (
                <div className="item-modal">
                    <div className="modal-content">
                        <button 
                            className="close-button"
                            onClick={() => setSelectedItem(null)}
                        >
                            <FaTimes />
                        </button>
                        <h3>{selectedItem.name}</h3>
                        <div className="restaurants-list">
                            {findItemInRestaurants(selectedItem.name).map((result, index) => (
                                <Link 
                                    to={`/products/${result.restaurantId}/${result.restaurantName}`}
                                    key={index}
                                    className="restaurant-item"
                                    onClick={() => setSelectedItem(null)}
                                >
                                    <div className="restaurant-info">
                                        <h4>{result.restaurantName}</h4>
                                        <p>₹{result.item.price}</p>
                                    </div>
                                    <button className="order-now-btn">
                                        Order Now
                                    </button>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ItemsDisplay