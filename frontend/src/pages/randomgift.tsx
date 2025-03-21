import React, { useState } from 'react'
import Navbar from '@/components/Navbar'
import GiftCardCreator from '@/components/GiftCardCreator'
import RandomGift from '@/components/RandomGift'


const creategift = () => {
  const [cardData, setCardData] = useState({
    recipient: '',
    amount: 0.05,
    currency: 'ETH',
    message: '',
    theme: 'blue' as 'blue' | 'purple' | 'green' | 'gold',
  });

  const handleUpdate = (data: typeof cardData) => {
    setCardData(data);
  };
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