import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { FaSun, FaMoon, FaSearch, FaUser } from 'react-icons/fa'
import { menuData } from '../data/menuData'
import { itemData } from '../data/itemData'

const TopBar = () => {
  const { theme, toggleTheme } = useTheme()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [showResults, setShowResults] = useState(false)
  const searchContainerRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowResults(false)
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
          
          <div className="authButtons">
            <button className="loginBtn">
              <FaUser />
              <span>Login</span>
            </button>
            <button className="signupBtn">Sign up</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TopBar