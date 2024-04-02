import React, { useState, useEffect } from 'react';
import Player from './Player';
import Meteor from './Meteor';

import Info from './Info.jsx';

const Game = () => {
    // State variables
    const [viewportSize, setViewportSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    const [playerPosition, setPlayerPosition] = useState({ x: viewportSize.width / 2, y: viewportSize.height / 2 });
    const [backgroundPosition, setBackgroundPosition] = useState({ x: 0, y: 0 });
    const [meteors, setMeteors] = useState([]);
    const [keysPressed, setKeysPressed] = useState({});
    const [speed, setSpeed] = useState(5); // Initial speed
    const [gameOver, setGameOver] = useState(false);
    const [win, Setwin] = useState(false)

    // Timer for tracking key press duration
    const [timer, setTimer] = useState(null);

    // Update viewport size
    useEffect(() => {
        const handleResize = () => {
            setViewportSize({ width: window.innerWidth, height: window.innerHeight });
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    // Game setup
    useEffect(() => {
        generateMeteors();
    }, []);

    // Generate meteors at random positions
    const generateMeteors = () => {
        const numMeteors =150;
        const meteorSpreadFactor = 5; // Adjust this factor as needed
        const newMeteors = [];
        for (let i = 0; i < numMeteors; i++) {
            newMeteors.push({
                id: i,
                position: {
                    x: Math.random() * viewportSize.width * meteorSpreadFactor,
                    y: Math.random() * viewportSize.height,
                },
                radius: 15, // Adjust the radius of meteors as needed
                velocity: {
                    x: Math.random() * 3 - 1,
                    y: Math.random() * 2 - 1,
                },
            });
        }
        setMeteors(newMeteors);
    };

    // Game loop
    useEffect(() => {

        const moveMeteors = () => {
            if (gameOver) return; // Stop moving meteors if game is over

            const collided = meteors.some((meteor) => {
                // Calculate distance between player and meteor
                const distanceX = playerPosition.x - meteor.position.x;
                const distanceY = playerPosition.y - meteor.position.y;
                const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

                if (playerPosition.x >= 9000) {
                    Setwin(true)
                }
                // Collision detection
                if (distance < 40 + meteor.radius) {
                    setGameOver(true);
                    return true; // Collision detected
                }else{
                    console.log(playerPosition)
                }

                return false;

            });

            if (!collided) {
                setMeteors((prevMeteors) =>
                    prevMeteors.map((meteor) => ({
                        ...meteor,
                        position: {
                            x: meteor.position.x + meteor.velocity.x,
                            y: meteor.position.y + meteor.velocity.y,
                        },
                    }))
                );
            }
        };

        const gameLoopInterval = setInterval(moveMeteors, 30);

        return () => clearInterval(gameLoopInterval);
    }, [meteors, gameOver, playerPosition]); // Add dependencies to prevent stale closures

    // Handle keyboard events for player movement
    useEffect(() => {
        const handleKeyDown = (event) => {
            setKeysPressed((prevKeysPressed) => ({
                ...prevKeysPressed,
                [event.key]: true,
            }));

            // Start the timer when the key is pressed
            if (!timer) {
                setTimer(setTimeout(() => {
                    // After 3 seconds, increase speed to 7
                    setSpeed(8);
                }, 3000));
            }
        };

        const handleKeyUp = (event) => {
            setKeysPressed((prevKeysPressed) => ({
                ...prevKeysPressed,
                [event.key]: false,
            }));

            // Reset the timer and speed when the key is released
            clearTimeout(timer);
            setTimer(null);
            setSpeed(5); // Reset speed to default
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [timer]); // Add timer to dependency array to avoid stale closure

    // Update player position based on pressed keys
    useEffect(() => {
        let deltaX = 0;
        let deltaY = 0;

        if (keysPressed['ArrowUp']) deltaY -= speed;
        if (keysPressed['ArrowDown']) deltaY += speed;
        if (keysPressed['ArrowLeft']) deltaX -= speed;
        if (keysPressed['ArrowRight']) deltaX += speed;

        setBackgroundPosition((prevPosition) => ({
            x: prevPosition.x + deltaX,
            y: prevPosition.y + deltaY,
        }));

        setPlayerPosition((prevPosition) => ({
            x: prevPosition.x - deltaX,
            y: prevPosition.y - deltaY,
        }));
    }, [keysPressed, speed, viewportSize]); // Include speed in dependencies



    return (
        <div className="relative w-screen h-screen bg-[url('/src/assets/space.jpeg')] overflow-hidden">
            <div
                className="absolute transition-all duration-500"
                style={{
                    transform: `translate(${backgroundPosition.x}px, ${backgroundPosition.y}px)`,
                }}
            >
                <Player speed={speed} position={playerPosition} /> 
                <Info  playerPosition={playerPosition} speed={speed}></Info>

                {meteors.map((meteor) => (
                    <Meteor key={meteor.id} position={meteor.position} />
                ))}
            </div>
            {gameOver && (
                <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-4xl bg-black bg-opacity-50">
                    Game Over!
                </div>
            )}
            {win && (
                <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-4xl bg-black bg-opacity-50">
                    You Won!
                </div>
            )}
        </div>
    );
    
};

export default Game;
