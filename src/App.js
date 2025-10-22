import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import ChatHistory from './components/ChatHistory';
import Profile from './components/Profile';
import Keyupdown from './Keyupdown';
import { usePara } from './SharedPara';

function App() {
    const { isAuthenticated, isVisitorMode, logoutTrigger } = usePara();




    const ChatWithSession = () => {
        const location = useLocation();
        const sessionId = new URLSearchParams(location.search).get('session');
        return (
            <Keyupdown elements={['input, button, a, .message-item']}
                page="chat"

                sessionId={sessionId} />
        );
    };

    return (
        <Router key={logoutTrigger}>
            <div className="App">
                <Routes>
                    <Route
                        path="/login"
                        element={
                            isAuthenticated ?
                                <Navigate to="/dashboard" replace /> :
                                <Keyupdown elements={['input', 'button']}
                                    page="login"
                                />

                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            (isAuthenticated || isVisitorMode) ?
                                <Keyupdown elements={[' button, a']}
                                    page="dashboard"

                                />
                                : <Navigate to="/login" replace />

                        }
                    />
                    <Route
                        path="/chat"
                        element={
                            isAuthenticated ?
                                <ChatWithSession /> :
                                <Navigate to="/login" replace />
                        }
                    />
                    <Route
                        path="/history"
                        element={
                            isAuthenticated ?
                                <Keyupdown elements={['button, a ']}
                                    page="chatHistory"

                                /> :
                                <Navigate to="/login" replace />
                        }
                    />
                    <Route
                        path="/profile"
                        element={
                            isAuthenticated ?
                                <Keyupdown elements={['input, button, a, select, textarea']}
                                    page="profile"


                                /> :
                                <Navigate to="/login" replace />
                        }
                    />
                    <Route
                        path="/"
                        element={<Navigate to="/login" replace />}
                    />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
