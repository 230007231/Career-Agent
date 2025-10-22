import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';
import { usePara } from '../SharedPara';

const Navigation = ({ handleSave }) => {
    const location = useLocation();
    const { user, isVisitorMode, showProfileMenu, setShowProfileMenu, handleLogout } = usePara();
    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    const toggleProfileMenu = () => {
        setShowProfileMenu(!showProfileMenu);
    };



    const handleVisitorLogout = () => {
        console.log('Visitor logout clicked');
        //remove visitor history
        const chatHistory = localStorage.getItem('careerCoachChatHistory' + user?.email);
        if (chatHistory) {
            for (const chat of chatHistory) {
                localStorage.removeItem(`chatHistory_${chat.id}`);
            }
            localStorage.removeItem('careerCoachChatHistory' + user?.email);
        }

        localStorage.removeItem('currentChatSession');
        handleLogout();
    };

    return (
        <nav className="navigation" role="navigation" aria-label="导航栏">
            <div className="nav-container">
                <div className="nav-left">
                    <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}
                        onClick={() => {
                            setShowProfileMenu(false);
                            if (handleSave)
                                handleSave();
                        }}>
                        <span className="nav-icon" aria-hidden="true">🏠</span>
                        <span className="nav-text">主页面</span>
                    </Link>
                </div>

                <div className="nav-right">
                    {!isVisitorMode && (
                        <div className="profile-section">
                            <button
                                className="profile-button"
                                onClick={toggleProfileMenu}
                                aria-label="档案栏"
                                aria-expanded={showProfileMenu}
                                aria-haspopup="true"
                            >
                                <span className="profile-icon" aria-hidden="true">👤</span>
                                <span className="profile-text">档案</span>
                            </button>

                            {showProfileMenu && (
                                <div className="profile-menu" role="menu" aria-label="档案栏">
                                    <div className="profile-info">
                                        <p className="profile-name">{user?.name}</p>
                                        <p className="profile-email">{user?.email}</p>
                                    </div>
                                    <Link
                                        to="/profile"
                                        className="profile-menu-link"
                                        onClick={() => setShowProfileMenu(false)}
                                        tabIndex="0"
                                        role="menuitem"
                                    >
                                        <span className="profile-menu-icon" aria-hidden="true">⚙️</span>
                                        <span>编辑档案</span>
                                    </Link>
                                    <button
                                        className="logout-button"
                                        onClick={handleLogout}
                                        role="menuitem"
                                        tabIndex="0"
                                    >
                                        <span className="logout-icon" aria-hidden="true">🚪</span>
                                        <span>登出</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {isVisitorMode && (
                        <div className="visitor-mode-section">
                            <span className="visitor-badge-nav" aria-hidden="true">访客模式</span>
                            <button
                                className="logout-button-nav"
                                onClick={handleVisitorLogout}
                                type="button"

                                aria-label="登陆"
                            >
                                <span>登陆</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
