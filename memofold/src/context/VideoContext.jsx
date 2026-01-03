import React, { createContext, useContext, useState, useEffect } from 'react';

const VideoContext = createContext();

export const useVideo = () => {
    const context = useContext(VideoContext);
    if (!context) {
        throw new Error('useVideo must be used within a VideoProvider');
    }
    return context;
};

export const VideoProvider = ({ children }) => {
    // Initialize from localStorage or default to false (unmuted)
    const [isGlobalMuted, setIsGlobalMuted] = useState(() => {
        const stored = localStorage.getItem('videoGlobalMuted');
        return stored === 'true';
    });

    const [activeVideoId, setActiveVideoId] = useState(null);

    // Persist mute state to localStorage
    useEffect(() => {
        localStorage.setItem('videoGlobalMuted', isGlobalMuted.toString());
    }, [isGlobalMuted]);

    const toggleGlobalMute = () => {
        setIsGlobalMuted(prev => !prev);
    };

    const setGlobalMuted = (muted) => {
        setIsGlobalMuted(muted);
    };

    return (
        <VideoContext.Provider value={{
            isGlobalMuted,
            toggleGlobalMute,
            setGlobalMuted,
            activeVideoId,
            setActiveVideoId
        }}>
            {children}
        </VideoContext.Provider>
    );
};
