/**
 * Utility functions for mapping between MongoDB ObjectIDs and numeric IDs
 * This helps with the integration between frontend static data and backend MongoDB data
 */

import { menuData } from '../suby/data/menuData';
import { restaurantData } from '../suby/data/restaurants';

/**
 * Maps restaurant names to their numeric IDs from the frontend static data
 */
const restaurantNameToNumericId = {
  "Paradise Biryani": "1",
  "Shah Ghouse": "2",
  "Mehfil Restaurant": "3",
  "Bawarchi": "4",
  "Pista House": "5",
  "Kritunga Restaurant": "6",
  "Cream Stone": "7",
  "Cafe Bahar": "8",
  "Hotel Shadab": "9"
};

/**
 * Maps MongoDB ObjectIDs to numeric IDs
 * This will be populated dynamically as we discover mappings
 */
const objectIdToNumericId = {};

/**
 * Check if an ID is a valid MongoDB ObjectID
 * @param {string} id - The ID to check
 * @returns {boolean} - Whether it matches MongoDB ObjectID pattern
 */
export const isMongoObjectId = (id) => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Try to find a numeric ID for a MongoDB ObjectID
 * @param {string} mongoId - The MongoDB ObjectID
 * @returns {string|null} - The numeric ID if found, null otherwise
 */
export const findNumericIdForMongoId = (mongoId) => {
  // If we already know the mapping, return it
  if (objectIdToNumericId[mongoId]) {
    return objectIdToNumericId[mongoId];
  }
  
  // Look through vendor data to find a match
  const foundVendor = restaurantData.vendors.find(vendor => 
    vendor._id === mongoId || 
    vendor.firm.some(firm => firm._id === mongoId)
  );
  
  if (foundVendor) {
    // Save the mapping for future use
    objectIdToNumericId[mongoId] = foundVendor._id;
    return foundVendor._id;
  }
  
  // Not found
  return null;
};

/**
 * Try to find a restaurant in menuData by either numeric ID or MongoDB ObjectID
 * @param {string} id - The ID to find (either numeric or MongoDB ObjectID)
 * @returns {object|null} - The restaurant data if found, null otherwise
 */
export const findRestaurantById = (id) => {
  // First, check if it's a direct match in menuData (numeric ID)
  if (menuData[id]) {
    return menuData[id];
  }
  
  // If it's a MongoDB ObjectID, try to find a numeric ID for it
  if (isMongoObjectId(id)) {
    const numericId = findNumericIdForMongoId(id);
    if (numericId && menuData[numericId]) {
      return menuData[numericId];
    }
  }
  
  // Not found
  return null;
};

/**
 * Get restaurant data from an API response and match it with local data if possible
 * @param {object} apiData - The API response data
 * @returns {object} - Enhanced restaurant data with local data merged in where possible
 */
export const enhanceApiRestaurantData = (apiData) => {
  if (!apiData) return null;
  
  // Try to find a matching restaurant in local data
  let localData = null;
  
  // Check by numericId or legacyId first
  if (apiData.numericId && menuData[apiData.numericId]) {
    localData = menuData[apiData.numericId];
  } else if (apiData.legacyId && menuData[apiData.legacyId]) {
    localData = menuData[apiData.legacyId];
  } else if (restaurantNameToNumericId[apiData.name]) {
    // Try to match by name
    const numericId = restaurantNameToNumericId[apiData.name];
    if (menuData[numericId]) {
      localData = menuData[numericId];
    }
  }
  
  // If we found local data, merge it with the API data
  if (localData) {
    return {
      ...apiData,
      // Use categories from local data if API data has none
      categories: apiData.categories && apiData.categories.length > 0 
        ? apiData.categories 
        : localData.categories,
      // Use items from local data if API data has none
      items: apiData.items && apiData.items.length > 0
        ? apiData.items.map(item => ({
            id: item._id,
            name: item.name,
            description: item.description || 'A delicious item prepared with care.',
            price: item.price,
            image: item.image || `https://source.unsplash.com/random/300x200/?${item.category || 'food'}`,
            category: item.category || 'Other'
          }))
        : localData.items,
      // Use sustainability metrics from local data if API data has none
      sustainabilityMetrics: apiData.sustainabilityMetrics || localData.sustainabilityMetrics
    };
  }
  
  // If no local data found, just return the API data with default values
  return {
    ...apiData,
    categories: apiData.categories && apiData.categories.length > 0 
      ? apiData.categories 
      : ['Main', 'Appetizers', 'Desserts'],
    items: (apiData.items || []).map(item => ({
      id: item._id,
      name: item.name,
      description: item.description || 'A delicious item prepared with care.',
      price: item.price || 299,
      image: item.image || `https://source.unsplash.com/random/300x200/?${item.category || 'food'}`,
      category: item.category || 'Main'
    }))
  };
};