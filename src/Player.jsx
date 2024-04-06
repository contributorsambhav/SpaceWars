// src/Player.js
import React from 'react';

const Player = ({ position ,speed}) => {
    return (
        <div
            className="absolute w-40 h-fit"
            style={{ left: position.x, top: position.y }}
        >

            <img src="/src/assets/ufo3.png" id="ufo" alt="hi there" />

            <div className='text-green-600 text-2xl text-center' style={{ left: position.x, top: position.y, zIndex: 2 }}>
                Position: {position.x}, {position.y} <br></br> Speed: {speed}
            </div>
        </div>
    );
};

export default Player;
