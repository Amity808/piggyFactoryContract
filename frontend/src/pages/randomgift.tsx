import React from 'react'
import Navbar from '@/components/Navbar'
import GiftCardCreator from '@/components/GiftCardCreator'
import RandomGift from '@/components/RandomGift'


const creategift = () => {
  
  const handleArrayChange = (values: string[]) => {
    console.log('Current values:', values);
  };
  return (
    <div>
        <Navbar />
        <div className='section'>
        <RandomGift onChange={handleArrayChange} />
        </div>
        
        
    </div>
  )
}

export default creategift