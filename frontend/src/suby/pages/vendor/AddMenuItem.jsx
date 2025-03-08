import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { API_URL } from '../../api';
import '../../styles/vendor.css';

const AddMenuItem = () => {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: null,
    ingredients: [],
    isAvailable: true,
    nutritionalInfo: {
      calories: '',
      protein: '',
      carbs: '',
      fat: ''
    },
    specialDiet: {
      isVegetarian: false,
      isVegan: false,
      isGlutenFree: false
    }
  });
  
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [restaurant, setRestaurant] = useState(null);
  
  useEffect(() => {
    const token = localStorage.getItem('vendorToken');
    if (!token) {
      navigate('/vendor/login');
      return;
    }

    fetchRestaurantDetails(token);
  }, [restaurantId, navigate]);

  const fetchRestaurantDetails = async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/restaurants/${restaurantId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch restaurant details');
      }

      const data = await response.json();
      setRestaurant(data);
    } catch (err) {
      setError(err.message);
    }
  };
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      // Handle nested properties
      const [parent, child] = name.split('.');
      setFormData({
        ...formData,
        [parent]: {
          ...formData[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
  };
  
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleIngredientsChange = (e) => {
    const ingredientsText = e.target.value;
    const ingredientsArray = ingredientsText
      .split(',')
      .map(ing => ing.trim())
      .filter(ing => ing !== '');
    
    setFormData({ ...formData, ingredients: ingredientsArray });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const token = localStorage.getItem('vendorToken');
    if (!token) {
      navigate('/vendor/login');
      return;
    }

    try {
      // Create FormData object for file upload
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('description', formData.description);
      formDataObj.append('price', formData.price);
      formDataObj.append('category', formData.category);
      formDataObj.append('restaurant', restaurantId);
      formDataObj.append('isAvailable', formData.isAvailable);
      
      // Add ingredients
      formDataObj.append('ingredients', JSON.stringify(formData.ingredients));
      
      // Add nutritional info
      formDataObj.append('nutritionalInfo', JSON.stringify(formData.nutritionalInfo));
      
      // Add special diet
      formDataObj.append('specialDiet', JSON.stringify(formData.specialDiet));
      
      // Add image if exists
      if (formData.image) {
        formDataObj.append('image', formData.image);
      }

      const response = await fetch(`${API_URL}/api/items`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formDataObj
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create menu item');
      }

      // Redirect to restaurant menu management
      navigate(`/vendor/restaurants/${restaurantId}?tab=menu`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="add-menu-item-container">
      <div className="form-header">
        <h2>Add Menu Item</h2>
        <button 
          onClick={() => navigate(`/vendor/restaurants/${restaurantId}`)} 
          className="back-btn"
        >
          Back to Restaurant
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}

      <form onSubmit={handleSubmit} className="menu-item-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          
          <div className="form-group">
            <label htmlFor="name">Item Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter item name"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter item description"
              rows="3"
            />
          </div>
          
          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="price">Price (₹)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="Enter price"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="form-group half">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Select a category</option>
                {restaurant && restaurant.categories && restaurant.categories.map((category, index) => (
                  <option key={index} value={category}>
                    {category}
                  </option>
                ))}
                <option value="new">+ Add New Category</option>
              </select>
              {formData.category === 'new' && (
                <input
                  type="text"
                  name="newCategory"
                  placeholder="Enter new category name"
                  className="new-category-input"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                />
              )}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="image">Item Image</label>
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleImageChange}
              accept="image/*"
            />
            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="Preview" />
              </div>
            )}
          </div>
          
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="isAvailable"
                checked={formData.isAvailable}
                onChange={handleChange}
              />
              Item is available for ordering
            </label>
          </div>
        </div>

        <div className="form-section">
          <h3>Ingredients & Dietary Information</h3>
          
          <div className="form-group">
            <label htmlFor="ingredients">Ingredients (comma-separated)</label>
            <textarea
              id="ingredients"
              name="ingredients"
              value={formData.ingredients.join(', ')}
              onChange={handleIngredientsChange}
              placeholder="E.g., Tomato, Cheese, Basil"
              rows="3"
            />
            <small>Enter ingredients separated by commas</small>
          </div>
          
          <div className="form-group checkbox-group">
            <h4>Dietary Options</h4>
            <label>
              <input
                type="checkbox"
                name="specialDiet.isVegetarian"
                checked={formData.specialDiet.isVegetarian}
                onChange={handleChange}
              />
              Vegetarian
            </label>
            <label>
              <input
                type="checkbox"
                name="specialDiet.isVegan"
                checked={formData.specialDiet.isVegan}
                onChange={handleChange}
              />
              Vegan
            </label>
            <label>
              <input
                type="checkbox"
                name="specialDiet.isGlutenFree"
                checked={formData.specialDiet.isGlutenFree}
                onChange={handleChange}
              />
              Gluten Free
            </label>
          </div>
        </div>

        <div className="form-section">
          <h3>Nutritional Information (Optional)</h3>
          
          <div className="form-row">
            <div className="form-group quarter">
              <label htmlFor="nutritionalInfo.calories">Calories</label>
              <input
                type="number"
                id="nutritionalInfo.calories"
                name="nutritionalInfo.calories"
                value={formData.nutritionalInfo.calories}
                onChange={handleChange}
                placeholder="kcal"
                min="0"
              />
            </div>
            <div className="form-group quarter">
              <label htmlFor="nutritionalInfo.protein">Protein</label>
              <input
                type="number"
                id="nutritionalInfo.protein"
                name="nutritionalInfo.protein"
                value={formData.nutritionalInfo.protein}
                onChange={handleChange}
                placeholder="g"
                min="0"
                step="0.1"
              />
            </div>
            <div className="form-group quarter">
              <label htmlFor="nutritionalInfo.carbs">Carbs</label>
              <input
                type="number"
                id="nutritionalInfo.carbs"
                name="nutritionalInfo.carbs"
                value={formData.nutritionalInfo.carbs}
                onChange={handleChange}
                placeholder="g"
                min="0"
                step="0.1"
              />
            </div>
            <div className="form-group quarter">
              <label htmlFor="nutritionalInfo.fat">Fat</label>
              <input
                type="number"
                id="nutritionalInfo.fat"
                name="nutritionalInfo.fat"
                value={formData.nutritionalInfo.fat}
                onChange={handleChange}
                placeholder="g"
                min="0"
                step="0.1"
              />
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={() => navigate(`/vendor/restaurants/${restaurantId}`)} 
            className="cancel-btn"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-btn" 
            disabled={loading}
          >
            {loading ? 'Creating...' : 'Create Menu Item'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddMenuItem;