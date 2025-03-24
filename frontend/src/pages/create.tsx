import React from 'react'
import Navbar from '@/components/Navbar'
import GiftCardCreator from '@/components/GiftCardCreator'
import CreateAccount from '@/components/CreateAccount'


const creategift = () => {
  
  return (
    <div>
        <Navbar />
        
        <GiftCardCreator />
        <div>
          <CreateAccount />
        </div>
        
    </div>
  )
}

export default creategift