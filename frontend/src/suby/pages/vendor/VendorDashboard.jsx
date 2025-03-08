import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_URL } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { FaPlus, FaImage } from 'react-icons/fa';
import '../../styles/vendor.css';

const VendorDashboard = () => {
  const { currentUser, token, logout } = useAuth();
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchVendorRestaurants();
  }, [token]);

  const fetchVendorRestaurants = async () => {
    if (!token) return;
    
    try {
      const response = await fetch(`${API_URL}/api/restaurants/vendor/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch restaurants');
      }

      const data = await response.json();
      setRestaurants(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/vendor/login');
  };

  if (loading) {
    return (
      <div className="vendor-dashboard">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="vendor-dashboard">
      <div className="dashboard-header">
        <h1>Vendor Dashboard</h1>
        <div className="dashboard-actions">
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="dashboard-welcome">
        <h2>Welcome, {currentUser?.businessName || 'Vendor'}!</h2>
      </div>

      {error && <div className="dashboard-error">{error}</div>}

      <div className="dashboard-section">
        <div className="section-header">
          <h3>Your Restaurants</h3>
          <Link to="/vendor/restaurants/add" className="add-btn">
            <FaPlus className="add-icon" />
            Add New Restaurant
          </Link>
        </div>

        {restaurants.length === 0 ? (
          <div className="empty-state">
            <p>You don't have any restaurants yet.</p>
            <Link to="/vendor/restaurants/add" className="add-btn">
              <FaPlus className="add-icon" />
              Add Your First Restaurant
            </Link>
          </div>
        ) : (
          <div className="restaurant-grid">
            {restaurants.map((restaurant) => (
              <div key={restaurant._id} className="restaurant-card">
                <div className="restaurant-image">
                  {restaurant.mainImage ? (
                    <img 
                      src={restaurant.mainImage.startsWith('http') 
                        ? restaurant.mainImage 
                        : `${API_URL}${restaurant.mainImage}`} 
                      alt={restaurant.name} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTkiPlJlc3RhdXJhbnQ8L3RleHQ+PC9zdmc+';
                      }}
                    />
                  ) : (
                    <div className="placeholder-image">
                      <FaImage className="placeholder-icon" />
                      <span>No Image</span>
                    </div>
                  )}
                </div>
                <div className="restaurant-details">
                  <h4>{restaurant.name}</h4>
                  <p>{restaurant.address?.city || 'No city'}, {restaurant.address?.state || 'No state'}</p>
                  <p>{restaurant.items?.length || 0} menu items</p>
                  <div className="restaurant-actions">
                    <Link to={`/vendor/restaurants/${restaurant._id}`} className="view-btn">Manage</Link>
                    <Link to={`/vendor/restaurants/${restaurant._id}/menu/add`} className="menu-btn">Add Menu</Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorDashboard;;