import React from 'react'
import ItemsDisplay from '../components/ItemsDisplay'
import Chains from '../components/Chains'
import FirmCollections from '../components/FirmCollections'
import ProductMenu from '../components/ProductMenu'

const LandingPage = () => {
  return (
    <div>
        <div className="landingSection">
            <ItemsDisplay />
            <Chains />
            <FirmCollections />
        </div>
    </div>
  )
}

export default LandingPage