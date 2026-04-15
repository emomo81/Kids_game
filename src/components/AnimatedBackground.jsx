import React, { useState, useEffect } from "react";

const TOTAL_FRAMES = 240;
const FRAME_PREFIX = "/backgrounds/ezgif-frame-";

export default function AnimatedBackground() {
    const [currentFrame, setCurrentFrame] = useState(1);

    // Pad the frame number with leading zeros (e.g., 1 -> 001)
    const getFramePath = (frame) => {
        const padded = frame.toString().padStart(3, "0");
        return `${FRAME_PREFIX}${padded}.jpg`;
    };

    useEffect(() => {
        let isMounted = true;

        const loadNextFrame = (frameNo) => {
            if (!isMounted) return;
            
            const nextFrame = (frameNo % TOTAL_FRAMES) + 1;
            const img = new Image();
            
            // Wait for the image to fully download before showing it
            img.onload = () => {
                if (!isMounted) return;
                setCurrentFrame(nextFrame);
                
                // Add a tiny artificial delay to match your ~24 FPS
                setTimeout(() => {
                    loadNextFrame(nextFrame);
                }, 41); 
            };
            
            // If the image fails to load, just skip to the next one
            img.onerror = () => {
                if (isMounted) setTimeout(() => loadNextFrame(nextFrame), 41);
            };

            // Using Request ID or similar might be cleaner, but simple image fetch works.
            img.src = getFramePath(nextFrame);
        };

        // Start the loop
        loadNextFrame(1);

        return () => {
            isMounted = false;
        };
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
