// This script helps debug issues with restaurant IDs
// Run it in the browser console to see all available restaurants and their IDs

(function debugRestaurantIds() {
  console.log('======= RESTAURANT ID DEBUGGING TOOL =======');
  
  // Check for local data
  const menuData = window.menuData;
  const restaurantData = window.restaurantData;
  
  if (!menuData || !restaurantData) {
    console.error('Local restaurant data not found in global scope');
    console.log('Try running this script on a page where the data is loaded');
    return;
  }
  
  // Log all local restaurants with their IDs
  console.log('LOCAL RESTAURANTS (menuData):');
  console.table(
    Object.entries(menuData).map(([id, restaurant]) => ({
      ID: id,
      Name: restaurant.name,
      Categories: (restaurant.categories || []).join(', '),
      'Menu Items': (restaurant.items || []).length
    }))
  );
  
  console.log('LOCAL RESTAURANTS (restaurantData):');
  console.table(
    restaurantData.vendors.map(vendor => ({
      ID: vendor._id,
      Name: vendor.firm?.[0]?.firmName || 'Unknown',
      Image: vendor.firm?.[0]?.image ? '✓' : '✗',
    }))
  );
  
  // Try to fetch from API
  const API_URL = window.API_URL || 'http://localhost:5000';
  
  fetch(`${API_URL}/api/restaurants`)
    .then(response => {
      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('API RESTAURANTS:');
      console.table(
        data.map(restaurant => ({
          'MongoDB ID': restaurant._id,
          'Numeric ID': restaurant.numericId || restaurant.legacyId || 'None',
          Name: restaurant.name,
          Categories: (restaurant.categories || []).join(', '),
          'Menu Items': (restaurant.items || []).length
        }))
      );
      
      // Check for ID conflicts
      const apiIds = new Set(data.map(r => r._id));
      const numericIds = new Set(Object.keys(menuData));
      
      console.log('ID ANALYSIS:');
      console.log(`Total API restaurants: ${data.length}`);
      console.log(`Total local restaurants: ${Object.keys(menuData).length}`);
      
      // Check for numeric IDs in API data
      const numericIdsInApi = data.filter(r => r.numericId || r.legacyId).length;
      console.log(`API restaurants with numeric IDs: ${numericIdsInApi}`);
      
      // Check for conflicts
      let conflicts = 0;
      numericIds.forEach(id => {
        if (apiIds.has(id)) {
          conflicts++;
          console.warn(`ID conflict: ${id} exists in both local and API data`);
        }
      });
      console.log(`ID conflicts: ${conflicts}`);
      
      console.log('======= END OF RESTAURANT ID DEBUGGING =======');
    })
    .catch(error => {
      console.error('Failed to fetch API restaurants:', error);
      console.log('======= END OF RESTAURANT ID DEBUGGING =======');
    });
})();