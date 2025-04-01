import React from 'react'
import RandomGift from '@/components/RandomGift'


const creategift = () => {
  
  const handleArrayChange = (values: string[]) => {
    console.log('Current values:', values);
  };
  return (
    <div>
        {/* <Navbar /> */}
        <div className='section'>
        <RandomGift onChange={handleArrayChange} />
        </div>
        
        
    </div>
  )
}

export default creategift