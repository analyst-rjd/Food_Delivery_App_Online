import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../api';
import { menuData } from '../data/menuData';
import { restaurantData } from '../data/restaurants';
import { FaShoppingCart, FaPlus, FaMinus } from 'react-icons/fa';
import CustomizationModal from './CustomizationModal';
import SustainabilityBadge from './SustainabilityBadge';
import ImageWithFallback from '../../components/common/ImageWithFallback';
import { findRestaurantById, enhanceApiRestaurantData, isMongoObjectId } from '../../utils/restaurantIdMapper';

const ProductMenu = () => {
    const { firmId } = useParams();
    const [restaurant, setRestaurant] = useState(null);
    const [cart, setCart] = useState({});
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [customizingItem, setCustomizingItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const navigate = useNavigate();
    
    useEffect(() => {
        const fetchRestaurant = async () => {
            try {
                console.log('ProductMenu: Fetching restaurant data for ID:', firmId);
                setLoading(true);
                setError(null);
                
                // First try to find the restaurant in local data
                const localRestaurant = findRestaurantById(firmId);
                if (localRestaurant) {
                    console.log('ProductMenu: Found restaurant in local data:', localRestaurant.name);
                    setRestaurant(localRestaurant);
                }
                
                // Try to get data from API regardless of whether local data was found
                try {
                    const response = await fetch(`${API_URL}/api/restaurants/${firmId}`);
                    if (!response.ok) {
                        throw new Error(`API returned ${response.status}: ${response.statusText}`);
                    }
                    
                    const data = await response.json();
                    console.log('ProductMenu: API returned restaurant data:', data);
                    
                    // Only proceed if we have valid data
                    if (data && data.name) {
                        // Check if items array exists and is valid
                        if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
                            console.warn('ProductMenu: No items found in API response, fetching items separately');
                            
                            // Fetch items separately
                            try {
                                const itemsResponse = await fetch(`${API_URL}/api/items/restaurant/${firmId}`);
                                if (itemsResponse.ok) {
                                    const itemsData = await itemsResponse.json();
                                    data.items = itemsData;
                                    console.log('ProductMenu: Fetched items separately:', itemsData);
                                }
                            } catch (itemsError) {
                                console.error('ProductMenu: Failed to fetch items separately:', itemsError);
                            }
                        }
                        
                        // Enhance the API data with local data if possible
                        const enhancedData = enhanceApiRestaurantData(data);
                        console.log('ProductMenu: Enhanced restaurant data:', enhancedData);
                        setRestaurant(enhancedData);
                    } else {
                        throw new Error('Invalid restaurant data received from API');
                    }
                } catch (apiError) {
                    console.error("ProductMenu: Failed to fetch from API:", apiError);
                    
                    // If we couldn't get API data and we don't have local data yet, try to use any available data
                    if (!localRestaurant) {
                        if (isMongoObjectId(firmId)) {
                            console.log("ProductMenu: This is a MongoDB ObjectID but not found in local data");
                            setError("Restaurant not found. It may have been deleted or is not available.");
                        } else {
                            console.log("ProductMenu: Not a valid ID format");
                            setError("Invalid restaurant ID format");
                        }
                    }
                    // If we have local data, we're already using it, so no need to do anything else
                }
            } catch (error) {
                console.error("ProductMenu: Critical error:", error);
                setError("An unexpected error occurred while loading the restaurant");
            } finally {
                setLoading(false);
            }
        };

        fetchRestaurant();
    }, [firmId]);

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Loading restaurant menu...</p>
            </div>
        );
    }

    if (error || !restaurant) {
        return (
            <div className="error-container">
                <h2>Restaurant Not Found</h2>
                <p>{error || "The requested restaurant could not be found"}</p>
                <button 
                    className="back-button"
                    onClick={() => navigate('/')}
                >
                    Back to Home
                </button>
            </div>
        );
    }

    const addToCart = (item, customizations = null) => {
        const cartItemId = customizations 
            ? `${item.id}_${JSON.stringify(customizations)}`
            : item.id;
            
        setCart(prev => ({
            ...prev,
            [cartItemId]: {
                ...prev[cartItemId],
                quantity: (prev[cartItemId]?.quantity || 0) + 1,
                item,
                customizations
            }
        }));
    };

    const removeFromCart = (cartItemId) => {
        setCart(prev => {
            const newCart = { ...prev };
            if (newCart[cartItemId].quantity > 1) {
                newCart[cartItemId].quantity--;
            } else {
                delete newCart[cartItemId];
            }
            return newCart;
        });
    };

    const getCartTotal = () => {
        return Object.values(cart).reduce((total, { quantity, item }) => {
            return total + (item.price * quantity);
        }, 0);
    };

    const handleCustomizationSave = (customizations) => {
        addToCart(customizingItem, customizations);
        setCustomizingItem(null);
    };

    // Make sure categories is an array
    const categories = Array.isArray(restaurant.categories) ? restaurant.categories : [];
    
    // Make sure items is an array
    const items = Array.isArray(restaurant.items) ? restaurant.items : [];

    return (
        <div className="menuContainer">
            <div className="menuHeader">
                <div>
                    <h2>{restaurant?.name}</h2>
                    {restaurant?.sustainabilityMetrics && (
                        <SustainabilityBadge metrics={restaurant.sustainabilityMetrics} />
                    )}
                </div>
                <div className="cartIcon">
                    <FaShoppingCart />
                    <span className="cartCount">
                        {Object.values(cart).reduce((a, { quantity }) => a + quantity, 0)}
                    </span>
                </div>
            </div>

            <div className="categoryFilter">
                <button 
                    className={selectedCategory === 'all' ? 'active' : ''} 
                    onClick={() => setSelectedCategory('all')}
                >
                    All
                </button>
                {categories.map(cat => (
                    <button
                        key={cat}
                        className={selectedCategory === cat ? 'active' : ''}
                        onClick={() => setSelectedCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="menuGrid">
                {items
                    .filter(item => selectedCategory === 'all' || item.category === selectedCategory)
                    .map(item => (
                        <div key={`menu-item-${item.id}`} className="menuItem">
                            <ImageWithFallback 
                                src={item.image}
                                alt={item.name}
                                fallbackType="food"
                            />
                            <div className="itemDetails">
                                <h3>{item.name}</h3>
                                <p>{item.description}</p>
                                <div className="itemPrice">₹{item.price}</div>
                                <div className="itemActions">
                                    {Object.entries(cart)
                                        .filter(([_, { item: cartItem }]) => cartItem.id === item.id)
                                        .map(([cartItemId, { quantity, customizations }], index) => (
                                            <div key={`cart-item-${cartItemId}-${index}`} className="quantityControl">
                                                <button onClick={() => removeFromCart(cartItemId)}>
                                                    <FaMinus />
                                                </button>
                                                <span>{quantity}</span>
                                                <button onClick={() => addToCart(item, customizations)}>
                                                    <FaPlus />
                                                </button>
                                                {customizations && <span className="customized-badge">Customized</span>}
                                            </div>
                                        ))}
                                    {!Object.values(cart).some(({ item: cartItem }) => cartItem.id === item.id) && (
                                        <button 
                                            className="addToCart"
                                            onClick={() => setCustomizingItem(item)}
                                        >
                                            Customize & Add
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
            </div>

            {items.length === 0 && (
                <div className="no-items-message">
                    <p>No menu items available for this restaurant.</p>
                </div>
            )}

            {customizingItem && (
                <CustomizationModal 
                    item={customizingItem}
                    onClose={() => setCustomizingItem(null)}
                    onSave={handleCustomizationSave}
                />
            )}

            {Object.keys(cart).length > 0 && (
                <div className="cartSummary">
                    <div className="cartTotal">
                        <span>Total: ₹{getCartTotal()}</span>
                        <button 
                            className="checkoutBtn" 
                            onClick={() => navigate('/order-tracking')}
                        >
                            Proceed to Checkout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductMenu;