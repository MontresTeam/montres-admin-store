import React from 'react'
import HomeGrid from './components/homeGrid'
import BrandNewAdded from './components/brandNew'
import Trusted from './components/trusted'

const page = () => {
  return (
    <div>
        <HomeGrid/>
        <BrandNewAdded/>
        <Trusted/>
    </div>
  )
}

export default page