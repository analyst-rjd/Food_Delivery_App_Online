import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { FaSun, FaMoon, FaSearch, FaUser, FaCaretDown, FaStore, FaSignOutAlt, FaUserCircle } from 'react-icons/fa'
import { menuData } from '../data/menuData'
import { itemData } from '../data/itemData'
import '../styles/profile.css'

const TopBar = () => {
  const { theme, toggleTheme } = useTheme()
  const { currentUser, isAuthenticated, logout } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const [showProfileDropdown, setShowProfileDropdown] = useState(false)
  const searchContainerRef = useRef(null)
  const profileDropdownRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowResults(false)
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleSearch = (query) => {
    setSearchQuery(query)
    
    if (query.trim() === '') {
      setSearchResults([])
      setShowResults(false)
      return
    }

    const normalizedQuery = query.toLowerCase().trim()

    // Search in restaurants and their items
    const restaurantResults = Object.entries(menuData).flatMap(([id, restaurant]) => {
      const matchingItems = restaurant.items.filter(item =>
        item.name.toLowerCase().includes(normalizedQuery) ||
        item.description?.toLowerCase().includes(normalizedQuery) ||
        item.category?.toLowerCase().includes(normalizedQuery)
      ).map(item => ({
        ...item,
        type: 'dish',
        restaurantId: id,
        restaurantName: restaurant.name
      }))

      if (restaurant.name.toLowerCase().includes(normalizedQuery)) {
        return [{
          id,
          name: restaurant.name,
          type: 'restaurant',
          categories: restaurant.categories
        }, ...matchingItems]
      }
      return matchingItems
    })

    // Search in popular dishes
    const popularDishResults = itemData
      .filter(item => item.name.toLowerCase().includes(normalizedQuery))
      .map(item => ({
        ...item,
        type: 'popular'
      }))

    setSearchResults([...restaurantResults, ...popularDishResults])
    setShowResults(true)
  }

  const handleResultClick = (result) => {
    setShowResults(false)
    setSearchQuery('')

    if (result.type === 'restaurant') {
      navigate(`/products/${result.id}/${result.name}`)
    } else if (result.type === 'dish' && result.restaurantId) {
      navigate(`/products/${result.restaurantId}/${result.restaurantName}`)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown)
  }

  return (
    <div className="topBarSection">
      <div className="topBarContent">
        <Link to="/" className="brand">
          Food Delivery
        </Link>
        
        <div className="searchContainer" ref={searchContainerRef}>
          <FaSearch className="searchIcon" />
          <input 
            type="text" 
            placeholder="Search for restaurants, cuisines..." 
            className="searchInput"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchResults.length > 0 && setShowResults(true)}
          />
          {showResults && searchResults.length > 0 && (
            <div className="searchResults">
              {searchResults.map((result, index) => (
                <div
                  key={`${result.type}-${result.id || index}`}
                  className="searchResultItem"
                  onClick={() => handleResultClick(result)}
                >
                  {result.type === 'restaurant' ? (
                    <>
                      <span className="resultName">{result.name}</span>
                      <span className="resultType">Restaurant</span>
                    </>
                  ) : (
                    <>
                      <span className="resultName">{result.name}</span>
                      {result.type === 'dish' && (
                        <span className="resultRestaurant">
                          at {result.restaurantName}
                        </span>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="navActions">
          <button 
            onClick={toggleTheme} 
            className="themeToggle"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <FaSun /> : <FaMoon />}
          </button>
          
          {isAuthenticated ? (
            <div className="profile-container" ref={profileDropdownRef}>
              <button className="profile-button" onClick={toggleProfileDropdown}>
                <FaUserCircle className="profile-icon" />
                <span>{currentUser?.businessName || 'Vendor'}</span>
                <FaCaretDown />
              </button>
              
              {showProfileDropdown && (
                <div className="profile-dropdown">
                  <div className="dropdown-header">
                    <FaUserCircle className="dropdown-icon" />
                    <div>
                      <div className="dropdown-name">{currentUser?.businessName || 'Vendor'}</div>
                      <div className="dropdown-email">{currentUser?.email}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button className="dropdown-item" onClick={() => navigate('/vendor/dashboard')}>
                    <FaStore className="dropdown-item-icon" />
                    <span>Dashboard</span>
                  </button>
                  <button className="dropdown-item" onClick={handleLogout}>
                    <FaSignOutAlt className="dropdown-item-icon" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="authButtons">
              <button className="loginBtn" onClick={() => navigate('/vendor/login')}>
                <FaUser />
                <span>Login</span>
              </button>
              <button className="signupBtn" onClick={() => navigate('/vendor/register')}>Sign up</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default TopBar