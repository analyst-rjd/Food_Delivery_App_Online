const mongoose = require('mongoose');

/**
 * Check if a string is a valid MongoDB ObjectId
 * @param {string} id - The ID to check
 * @returns {boolean} - Whether the ID is a valid ObjectId
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Safely convert an ID to a MongoDB ObjectId
 * If the ID is already a valid ObjectId, it returns it
 * If the ID is numeric, it tries to handle it
 * @param {string} id - The ID to convert
 * @returns {mongoose.Types.ObjectId|null} - The ObjectId or null if conversion fails
 */
const safeObjectId = (id) => {
  if (!id) return null;
  
  // If already a valid ObjectId, return it
  if (isValidObjectId(id)) {
    return mongoose.Types.ObjectId(id);
  }
  
  // For numeric IDs, we need to handle them specially
  // This is a workaround for the frontend using numeric IDs
  return null;
};

/**
 * Create a query that can find a document by either ObjectId or numeric ID
 * @param {string} id - The ID to query for
 * @param {string} field - The field to query on (default: '_id')
 * @returns {Object} - A MongoDB query object
 */
const createIdQuery = (id, field = '_id') => {
  // If it's a valid ObjectId, use it directly
  if (isValidObjectId(id)) {
    return { [field]: mongoose.Types.ObjectId(id) };
  }
  
  // Otherwise, try both the original ID and as string
  return { 
    $or: [
      { [field]: id },
      { 'legacyId': id } // If you have a legacyId field for numeric IDs
    ]
  };
};

module.exports = {
  isValidObjectId,
  safeObjectId,
  createIdQuery
};