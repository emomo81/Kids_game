import React, { useState, useEffect } from "react";

const TOTAL_FRAMES = 240;
const FRAME_PREFIX = "/backgrounds/ezgif-frame-";
const FPS = 24; // Frames per second for the animation

export default function AnimatedBackground() {
    const [currentFrame, setCurrentFrame] = useState(1);

    // Pad the frame number with leading zeros (e.g., 1 -> 001)
    const getFramePath = (frame) => {
        const padded = frame.toString().padStart(3, "0");
        return `${FRAME_PREFIX}${padded}.jpg`;
    };

    useEffect(() => {
        // Preload a few upcoming frames to prevent flickering
        const preloadFrames = () => {
            for (let i = 1; i <= Math.min(20, TOTAL_FRAMES); i++) {
                const img = new Image();
                img.src = getFramePath(i);
            }
        };
        preloadFrames();

        // Set up the animation interval
        const interval = setInterval(() => {
            setCurrentFrame((prev) => (prev % TOTAL_FRAMES) + 1);
        }, 1000 / FPS);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed inset-0 w-full h-full -z-10 bg-slate-900 pointer-events-none overflow-hidden">
            {/* 
        We use an image tag to display the current frame.
        Using object-cover to ensure it fills the screen perfectly like a background-size: cover.
      */}
            <img
                src={getFramePath(currentFrame)}
                alt="Animated Background"
                className="w-full h-full object-cover"
                // Prevent image dragging/selecting
                draggable={false}
                style={{ userSelect: "none" }}
            />
            {/* Optional overlay to make content more readable */}
            <div className="absolute inset-0 bg-black/20" />
        </div>
    );
}
