import React from 'react';

const Info = ({ playerPosition, speed }) => {
  return (
    <div  className='text-green-600 text-2xl text-center'>
      Position: {playerPosition.x}, {playerPosition.y} | Speed: {speed}
    </div>
  );
};



export default Info;
