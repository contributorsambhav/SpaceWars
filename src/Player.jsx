// src/Player.js
import React from 'react';

const Player = ({ position }) => {
    return (
        <div
            className="absolute w-40 h-fit"
            style={{ left: position.x, top: position.y }}
        >

        <img src="/src/assets/ufo3.png" id= "ufo" alt="hi there" />
        </div>
    );
};

export default Player;
