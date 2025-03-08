import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { API_URL } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { FaImage, FaEdit, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import '../../styles/vendor.css';

const RestaurantManagement = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    if (!token) {
      navigate('/vendor/login');
      return;
    }

    fetchRestaurantDetails();
  }, [id, navigate, token]);

  const fetchRestaurantDetails = async () => {
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_URL}/api/restaurants/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 404) {
        setError('Restaurant not found. It may have been deleted.');
        setRestaurant(null);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch restaurant details');
      }

      const data = await response.json();
      
      // Ensure all required properties exist
      if (!data.address) {
        data.address = { street: '', city: '', state: '', zipCode: '', country: '' };
      }
      
      if (!data.categories) {
        data.categories = [];
      }
      
      if (!data.items) {
        data.items = [];
      }
      
      setRestaurant(data);
    } catch (err) {
      console.error('Error fetching restaurant:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRestaurant = async () => {
    if (!window.confirm('Are you sure you want to delete this restaurant? This action cannot be undone.')) {
      return;
    }

    if (!token) {
      navigate('/vendor/login');
      return;
    }

    try {
      setDeleteLoading(true);
      setError('');
      
      console.log('Deleting restaurant with ID:', id);
      
      const response = await fetch(`${API_URL}/api/restaurants/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 404) {
        throw new Error('Restaurant not found. It may have already been deleted.');
      }

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete restaurant');
      }

      // Show success message before redirecting
      alert('Restaurant deleted successfully!');
      navigate('/vendor/dashboard');
    } catch (err) {
      console.error('Error deleting restaurant:', err);
      setError(`Failed to delete restaurant: ${err.message}`);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="restaurant-management">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="restaurant-management">
        <div className="error-state">
          <FaExclamationTriangle className="error-icon" />
          <h2>Restaurant not found</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/vendor/dashboard')} className="back-btn">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="restaurant-management">
      <div className="management-header">
        <h1>{restaurant.name}</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/vendor/dashboard')} className="back-btn">
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="management-tabs">
        <button 
          className={`tab-btn ${activeTab === 'details' ? 'active' : ''}`}
          onClick={() => setActiveTab('details')}
        >
          Details
        </button>
        <button 
          className={`tab-btn ${activeTab === 'menu' ? 'active' : ''}`}
          onClick={() => setActiveTab('menu')}
        >
          Menu
        </button>
        <button 
          className={`tab-btn ${activeTab === 'gallery' ? 'active' : ''}`}
          onClick={() => setActiveTab('gallery')}
        >
          Gallery
        </button>
      </div>

      {error && <div className="management-error">{error}</div>}

      <div className="management-content">
        {activeTab === 'details' && (
          <div className="restaurant-details">
            <div className="detail-card">
              <div className="restaurant-image">
                {restaurant.mainImage ? (
                  <img 
                    src={restaurant.mainImage.startsWith('http') 
                      ? restaurant.mainImage 
                      : `${API_URL}${restaurant.mainImage}`} 
                    alt={restaurant.name} 
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTkiPlJlc3RhdXJhbnQgSW1hZ2U8L3RleHQ+PC9zdmc+';
                    }}
                  />
                ) : (
                  <div className="placeholder-image">
                    <FaImage className="placeholder-icon" />
                    <span>No Image Available</span>
                  </div>
                )}
              </div>
              
              <div className="detail-section">
                <h3>Basic Information</h3>
                <div className="detail-row">
                  <span className="detail-label">Name:</span>
                  <span className="detail-value">{restaurant.name}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Phone:</span>
                  <span className="detail-value">{restaurant.phone || 'Not provided'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{restaurant.email || 'Not provided'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Categories:</span>
                  <span className="detail-value">
                    {restaurant.categories && restaurant.categories.length > 0
                      ? restaurant.categories.join(', ')
                      : 'No categories'}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Delivery Radius:</span>
                  <span className="detail-value">{restaurant.deliveryRadius || 5} km</span>
                </div>
              </div>
              
              <div className="detail-section">
                <h3>Address</h3>
                {restaurant.address ? (
                  <>
                    <div className="detail-row">
                      <span className="detail-label">Street:</span>
                      <span className="detail-value">{restaurant.address.street || 'Not provided'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">City:</span>
                      <span className="detail-value">{restaurant.address.city || 'Not provided'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">State:</span>
                      <span className="detail-value">{restaurant.address.state || 'Not provided'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">ZIP Code:</span>
                      <span className="detail-value">{restaurant.address.zipCode || 'Not provided'}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Country:</span>
                      <span className="detail-value">{restaurant.address.country || 'Not provided'}</span>
                    </div>
                  </>
                ) : (
                  <div className="detail-row">
                    <span className="detail-value">No address provided</span>
                  </div>
                )}
              </div>
              
              <div className="detail-section">
                <h3>Opening Hours</h3>
                {restaurant.openingHours && Object.keys(restaurant.openingHours).length > 0 ? (
                  Object.entries(restaurant.openingHours).map(([day, hours]) => (
                    <div className="detail-row" key={day}>
                      <span className="detail-label">{day.charAt(0).toUpperCase() + day.slice(1)}:</span>
                      <span className="detail-value">
                        {hours.open} - {hours.close}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="detail-row">
                    <span className="detail-value">No opening hours provided</span>
                  </div>
                )}
              </div>
              
              <div className="detail-actions">
                <Link to={`/vendor/restaurants/${id}/edit`} className="edit-btn">
                  <FaEdit className="action-icon" />
                  Edit Restaurant
                </Link>
                <button 
                  onClick={handleDeleteRestaurant} 
                  className="delete-btn"
                  disabled={deleteLoading}
                >
                  <FaTrash className="action-icon" />
                  {deleteLoading ? 'Deleting...' : 'Delete Restaurant'}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'menu' && (
          <div className="restaurant-menu">
            <div className="menu-header">
              <h3>Menu Items</h3>
              <Link to={`/vendor/restaurants/${id}/menu/add`} className="add-btn">
                Add Menu Item
              </Link>
            </div>

            {restaurant.items && restaurant.items.length > 0 ? (
              <div className="menu-items">
                {restaurant.items.map((item) => (
                  <div key={item._id || `item-${Math.random()}`} className="menu-item-card">
                    <div className="item-image">
                      {item.image ? (
                        <img 
                          src={item.image.startsWith('http') 
                            ? item.image 
                            : `${API_URL}${item.image}`} 
                          alt={item.name} 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTUwIiBoZWlnaHQ9IjE1MCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTkiPk1lbnUgSXRlbTwvdGV4dD48L3N2Zz4=';
                          }}
                        />
                      ) : (
                        <div className="placeholder-image small">
                          <FaImage className="placeholder-icon" />
                        </div>
                      )}
                    </div>
                    <div className="item-details">
                      <h4>{item.name}</h4>
                      <p className="item-category">{item.category || 'Uncategorized'}</p>
                      <p className="item-price">${(item.price || 0).toFixed(2)}</p>
                      <p className="item-description">{item.description || 'No description'}</p>
                      <div className="item-actions">
                        <Link to={`/vendor/restaurants/${id}/menu/${item._id}/edit`} className="edit-btn">
                          <FaEdit className="action-icon-sm" />
                          Edit
                        </Link>
                        <button className="delete-btn">
                          <FaTrash className="action-icon-sm" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No menu items added yet.</p>
                <Link to={`/vendor/restaurants/${id}/menu/add`} className="add-btn">
                  Add Your First Menu Item
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="restaurant-gallery">
            <div className="gallery-header">
              <h3>Restaurant Gallery</h3>
              <Link to={`/vendor/restaurants/${id}/gallery/add`} className="add-btn">
                Add Images
              </Link>
            </div>

            {restaurant.images && restaurant.images.length > 0 ? (
              <div className="gallery-grid">
                {restaurant.images.map((image, index) => (
                  <div key={`gallery-${index}`} className="gallery-item">
                    <img 
                      src={image.startsWith('http') ? image : `${API_URL}${image}`} 
                      alt={`Gallery ${index + 1}`} 
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YwZjBmMCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMTgiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIGZpbGw9IiM5OTkiPkltYWdlPC90ZXh0Pjwvc3ZnPg==';
                      }}
                    />
                    <button className="remove-btn">
                      <FaTrash className="action-icon-sm" />
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No gallery images added yet.</p>
                <Link to={`/vendor/restaurants/${id}/gallery/add`} className="add-btn">
                  Add Your First Gallery Image
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default RestaurantManagement;