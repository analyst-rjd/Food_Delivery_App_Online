import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../../api';
import { useAuth } from '../../context/AuthContext';
import '../../styles/vendor.css';

const EditRestaurant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
    deliveryRadius: 5,
    mainImage: null,
    categories: [],
    openingHours: {
      monday: { open: '09:00', close: '22:00' },
      tuesday: { open: '09:00', close: '22:00' },
      wednesday: { open: '09:00', close: '22:00' },
      thursday: { open: '09:00', close: '22:00' },
      friday: { open: '09:00', close: '22:00' },
      saturday: { open: '09:00', close: '22:00' },
      sunday: { open: '09:00', close: '22:00' }
    }
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/vendor/login');
      return;
    }

    // Fetch restaurant data
    fetchRestaurantData();
  }, [id, token, navigate]);

  const fetchRestaurantData = async () => {
    try {
      setFetchLoading(true);
      setError('');
      
      const response = await fetch(`${API_URL}/api/restaurants/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 404) {
        setError('Restaurant not found. It may have been deleted.');
        setFetchLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch restaurant details');
      }

      const data = await response.json();
      
      // Initialize address if not present
      if (!data.address) {
        data.address = { street: '', city: '', state: '', zipCode: '', country: 'India' };
      }
      
      // Initialize opening hours if not present
      if (!data.openingHours) {
        data.openingHours = {
          monday: { open: '09:00', close: '22:00' },
          tuesday: { open: '09:00', close: '22:00' },
          wednesday: { open: '09:00', close: '22:00' },
          thursday: { open: '09:00', close: '22:00' },
          friday: { open: '09:00', close: '22:00' },
          saturday: { open: '09:00', close: '22:00' },
          sunday: { open: '09:00', close: '22:00' }
        };
      }
      
      // Set form data
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
        email: data.email || '',
        street: data.address.street || '',
        city: data.address.city || '',
        state: data.address.state || '',
        zipCode: data.address.zipCode || '',
        country: data.address.country || 'India',
        deliveryRadius: data.deliveryRadius || 5,
        categories: data.categories || [],
        openingHours: data.openingHours,
        // Don't set mainImage here, it will be uploaded only if user selects a new one
      });
      
      // Set image preview if there's a main image
      if (data.mainImage) {
        const imageUrl = data.mainImage.startsWith('http') 
          ? data.mainImage 
          : `${API_URL}${data.mainImage}`;
        setImagePreview(imageUrl);
      }
    } catch (err) {
      console.error('Error fetching restaurant:', err);
      setError(err.message);
    } finally {
      setFetchLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties (for opening hours)
      const [parent, child, subchild] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: {
            ...formData[parent][child],
            [subchild]: value
          }
        }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, mainImage: file });
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategoryChange = (e) => {
    const categoriesText = e.target.value;
    const categoriesArray = categoriesText
      .split(',')
      .map(cat => cat.trim())
      .filter(cat => cat !== '');
    
    setFormData({ ...formData, categories: categoriesArray });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create FormData object for file upload
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('phone', formData.phone);
      formDataObj.append('email', formData.email);
      
      // Add address
      const address = {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country
      };
      formDataObj.append('address', JSON.stringify(address));
      
      // Add delivery radius
      formDataObj.append('deliveryRadius', formData.deliveryRadius);
      
      // Add categories
      formDataObj.append('categories', JSON.stringify(formData.categories));
      
      // Add opening hours
      formDataObj.append('openingHours', JSON.stringify(formData.openingHours));
      
      // Add main image if exists
      if (formData.mainImage) {
        formDataObj.append('mainImage', formData.mainImage);
      }

      const response = await fetch(`${API_URL}/api/restaurants/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formDataObj
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update restaurant');
      }

      // Show success message
      alert('Restaurant updated successfully!');
      
      // Redirect to restaurant management page
      navigate(`/vendor/restaurants/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="add-restaurant-container">
        <div className="loading">Loading restaurant data...</div>
      </div>
    );
  }

  if (error && !formData.name) {
    return (
      <div className="add-restaurant-container">
        <div className="error-state">
          <h2>Error</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/vendor/dashboard')} className="back-btn">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="add-restaurant-container">
      <div className="form-header">
        <h2>Edit Restaurant</h2>
        <button onClick={() => navigate(`/vendor/restaurants/${id}`)} className="back-btn">
          Back to Restaurant
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit} className="restaurant-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="name">Restaurant Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter restaurant name"
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                required
              />
            </div>
            <div className="form-group half">
              <label htmlFor="email">Email (Optional)</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="categories">Categories (comma-separated)</label>
            <input
              type="text"
              id="categories"
              name="categories"
              value={formData.categories.join(', ')}
              onChange={handleCategoryChange}
              placeholder="E.g., Italian, Pizza, Pasta"
            />
            <small>Enter categories separated by commas</small>
          </div>
          
          <div className="form-group">
            <label htmlFor="mainImage">Restaurant Image</label>
            <input
              type="file"
              id="mainImage"
              name="mainImage"
              onChange={handleImageChange}
              accept="image/*"
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
                <small>Leave empty to keep current image</small>
              </div>
            )}
          </div>
        </div>

        <div className="form-section">
          <h3>Address</h3>
          
          <div className="form-group">
            <label htmlFor="street">Street Address</label>
            <input
              type="text"
              id="street"
              name="street"
              value={formData.street}
              onChange={handleChange}
              placeholder="Enter street address"
              required
            />
          </div>
          
          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="city">City</label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="City"
                required
              />
            </div>
            <div className="form-group half">
              <label htmlFor="state">State</label>
              <input
                type="text"
                id="state"
                name="state"
                value={formData.state}
                onChange={handleChange}
                placeholder="State"
                required
              />
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="zipCode">ZIP Code</label>
              <input
                type="text"
                id="zipCode"
                name="zipCode"
                value={formData.zipCode}
                onChange={handleChange}
                placeholder="ZIP Code"
                required
              />
            </div>
            <div className="form-group half">
              <label htmlFor="country">Country</label>
              <input
                type="text"
                id="country"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="Country"
                required
              />
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="deliveryRadius">Delivery Radius (km)</label>
            <input
              type="number"
              id="deliveryRadius"
              name="deliveryRadius"
              value={formData.deliveryRadius}
              onChange={handleChange}
              min="1"
              max="50"
            />
          </div>
        </div>

        <div className="form-section">
          <h3>Opening Hours</h3>
          
          {Object.keys(formData.openingHours).map((day) => (
            <div key={day} className="form-row">
              <div className="form-group day-label">
                <label>{day.charAt(0).toUpperCase() + day.slice(1)}</label>
              </div>
              <div className="form-group time-input">
                <label htmlFor={`openingHours.${day}.open`}>Open</label>
                <input
                  type="time"
                  id={`openingHours.${day}.open`}
                  name={`openingHours.${day}.open`}
                  value={formData.openingHours[day].open}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group time-input">
                <label htmlFor={`openingHours.${day}.close`}>Close</label>
                <input
                  type="time"
                  id={`openingHours.${day}.close`}
                  name={`openingHours.${day}.close`}
                  value={formData.openingHours[day].close}
                  onChange={handleChange}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate(`/vendor/restaurants/${id}`)} 
            className="cancel-btn"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Restaurant'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditRestaurant;