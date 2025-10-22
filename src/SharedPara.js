import React, { createContext, useContext, useState, useEffect } from 'react';

// 创建上下文
const ParaContext = createContext();

// 创建提供者组件
export const ParaProvider = ({ children }) => {
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isVisitorMode, setIsVisitorMode] = useState(false);
    const [user, setUser] = useState(null);
    const [chatHistory, setChatHistory] = useState([]);
    const [logoutTrigger, setLogoutTrigger] = useState(0);
    const formDataToSend = new FormData();
    useEffect(() => {

    }, [user]);
    const handleLogin = (userData, visitor = false) => {
        setIsAuthenticated(true);
        setIsVisitorMode(visitor);
        setUser(userData);
    };

    const handleUpdateUser = (updatedUserData) => {
        setUser(updatedUserData);
    };

    const handleLogout = () => {
        console.log('Navigation handleLogout called');

        setShowProfileMenu(false);
        console.log('App handleLogout called - Before:', { isAuthenticated, isVisitorMode, user });

        // Clear all authentication state
        setIsAuthenticated(false);
        setIsVisitorMode(false);
        setUser(null);
        localStorage.removeItem('currentChatSession');
        console.log('App handleLogout - State cleared');

        // Force re-render to ensure route protection works
        setLogoutTrigger(prev => prev + 1);

        // Force a small delay to ensure state updates are processed
        setTimeout(() => {
            console.log('App handleLogout completed - Should redirect to login now');
            // The route protection should automatically redirect to login
        }, 100);
    };
    return (
        <ParaContext.Provider value={{
            showProfileMenu, setShowProfileMenu,
            isEditing, setIsEditing,
            isAuthenticated, setIsAuthenticated,
            isVisitorMode, setIsVisitorMode,
            user, setUser,
            chatHistory, setChatHistory,
            handleLogin,
            handleUpdateUser,
            handleLogout,
            formDataToSend
        }}>
            {children}
        </ParaContext.Provider>
    );
};

// 自定义 Hook 方便使用上下文
export const usePara = () => useContext(ParaContext);