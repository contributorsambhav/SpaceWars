// src/Meteor.js
import React from 'react';

const Meteor = ({ position }) => {
    return (
        <div
            className="absolute w-16 h-16    rounded-full"
            style={{ left: position.x, top: position.y }}
        >        <img src="/src/assets/asteroid.png" id= "ufo" alt="hi there" />
        </div>
    );
};

export default Meteor;
