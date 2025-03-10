import './App.css'
import './suby/styles/loading.css'
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './suby/context/ThemeContext'
import { AuthProvider } from './suby/context/AuthContext'
import TopBar from './suby/components/TopBar'
import LandingPage from './suby/pages/LandingPage'
import ProductMenu from './suby/components/ProductMenu'
import OrderTracking from './suby/pages/OrderTracking'
import VendorLogin from './suby/pages/vendor/VendorLogin'
import VendorRegister from './suby/pages/vendor/VendorRegister'
import ProtectedRoute from './suby/components/ProtectedRoute'
import VendorDashboard from './suby/pages/vendor/VendorDashboard'
import AddRestaurant from './suby/pages/vendor/AddRestaurant'
import RestaurantManagement from './suby/pages/vendor/RestaurantManagement'
import EditRestaurant from './suby/pages/vendor/EditRestaurant'
import AddMenuItem from './suby/pages/vendor/AddMenuItem'

const App = () => {
  return (
    <AuthProvider>
      <ThemeProvider>
        <TopBar />
        <main>
          <Routes>
              {/* Customer Routes */}
              <Route path='/' element={<LandingPage />} />
              <Route path='/products/:firmId/:firmName' element={<ProductMenu />} />
              <Route path='/order-tracking' element={<OrderTracking />} />
              
              {/* Public Vendor Routes */}
              <Route path='/vendor/login' element={<VendorLogin />} />
              <Route path='/vendor/register' element={<VendorRegister />} />
              
              {/* Protected Vendor Routes */}
              <Route element={<ProtectedRoute />}>
                <Route path='/vendor/dashboard' element={<VendorDashboard />} />
                <Route path='/vendor/restaurants/add' element={<AddRestaurant />} />
                <Route path='/vendor/restaurants/:id' element={<RestaurantManagement />} />
                <Route path='/vendor/restaurants/:id/edit' element={<EditRestaurant />} />
                <Route path='/vendor/restaurants/:restaurantId/menu/add' element={<AddMenuItem />} />
              </Route>
          </Routes>
        </main>
      </ThemeProvider>
    </AuthProvider>
  )
}

export default App