import React, { useState } from 'react'
import Navbar from '@/components/Navbar'
import GiftCardCreator from '@/components/GiftCardCreator'



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
  return (
    <div>
        <Navbar />
        <GiftCardCreator />
        
    </div>
  )
}

export default creategift