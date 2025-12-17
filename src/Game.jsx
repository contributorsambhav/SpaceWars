import React, { useEffect, useState } from 'react';

import Meteor from './Meteor';
import Player from './Player';
import Sound from 'react-sound';

const Game = () => {
    // State variables
    const [playStatus, setPlayStatus] = useState(Sound.status.STOPPED);
    const [loseStatus, setLoseStatus] = useState(Sound.status.STOPPED);
    const playSound = () => {
        setPlayStatus(Sound.status.PLAYING);
    };

    const stopSound = () => {
        setPlayStatus(Sound.status.STOPPED);
    };

    const [timeRemaining, setTimeRemaining] = useState(90); // Initial time limit in seconds

    const [viewportSize, setViewportSize] = useState({ width: window.innerWidth, height: window.innerHeight });
    const [playerPosition, setPlayerPosition] = useState({ x: viewportSize.width / 2, y: viewportSize.height / 2 });
    const [backgroundPosition, setBackgroundPosition] = useState({ x: 0, y: 0 });
    const [meteors, setMeteors] = useState([]);
    const [keysPressed, setKeysPressed] = useState({});
    const [speed, setSpeed] = useState(5); // Initial speed
    const [gameOver, setGameOver] = useState(false);
    const [win, setWin] = useState(false);

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

        const timerInterval = setInterval(() => {
            setTimeRemaining(prevTime => {
                const newTime = prevTime - 1;
                console.log("New time:", newTime); // Log the updated time
                return newTime;
            });
        }, 1000);

        return () => clearInterval(timerInterval); // Cleanup timer interval
    }, []);

    useEffect(() => {
        if (timeRemaining <= 0) {
            setGameOver(true); // End the game if time runs out
        }
    }, [timeRemaining]);

    // Generate meteors at random positions
    const generateMeteors = () => {
        const numMeteors = 240;
        const meteorSpreadFactor = 5.4; // Adjust this factor as needed
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
                    x: Math.random() * 4.2 - 1,
                    y: Math.random() * 1.9 - 1,
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
                const distanceX = (playerPosition.x + 40) - meteor.position.x;
                const distanceY = playerPosition.y - meteor.position.y;
                const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

                if (playerPosition.x >= 9000) {
                    setWin(true);
                    playSound();
                }
                // Collision detection
                if (((distance < 40 + meteor.radius) || playerPosition.y > 740) || playerPosition.y < 0) {
                    setGameOver(true);
                    setLoseStatus(Sound.status.PLAYING); // Play sound on loss
                    return true; // Collision detected
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
    }, [meteors, gameOver]); // Add dependencies to prevent stale closures

    // Handle keyboard events for player movement
    useEffect(() => {
        const handleKeyDown = (event) => {
            let { key } = event;
            setKeysPressed((prevKeysPressed) => ({
                ...prevKeysPressed,
                [key]: true,
            }));

            if (key === "w"){
                key='ArrowUp'
            }
            if(key==="a"){
                key ='ArrowLeft'
            }
            if(key==="s"){
                key ='ArrowDown'
            }
            if(key==="d"){
                key ='ArrowRight'
            }
        
            // Start the timer when any navigation key or WASD key is pressed
            if (!timer && (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight')) {
                setTimer(setTimeout(() => {
                    // After 3 seconds, increase speed to 8
                    setSpeed(8);
                }, 3000));
            }
        };
        
        const handleKeyUp = (event) => {
            let { key } = event;
            setKeysPressed((prevKeysPressed) => ({
                ...prevKeysPressed,
                [key]: false,
            }));

            if (key === "w"){
                key='ArrowUp'
            }
            if(key==="a"){
                key ='ArrowLeft'
            }
            if(key==="s"){
                key ='ArrowDown'
            }
            if(key==="d"){
                key ='ArrowRight'
            }

            // Reset the timer and speed when any navigation key or WASD key is released
            if (timer && (key === 'ArrowUp' || key === 'ArrowDown' || key === 'ArrowLeft' || key === 'ArrowRight')) {
                clearTimeout(timer);
                setTimer(null);
                setSpeed(5); // Reset speed to default
            }
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
        <>
            <Sound url="win.wav" playStatus={playStatus} onFinishedPlaying={stopSound} />
            <Sound url="gameOver.wav" playStatus={loseStatus} onFinishedPlaying={stopSound} />

            <div className='relative w-screen h-screen bg-[url("space.jpeg")] overflow-hidden'>
                <div
                    className="absolute transition-all duration-500"
                    style={{
                        transform: `translate(${backgroundPosition.x}px, ${backgroundPosition.y}px)`,
                    }}
                >
                    <Player timeRemaining={timeRemaining} speed={speed} position={playerPosition} />

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
        </>
    );
};

export default Game;
