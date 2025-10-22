import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navigation from './Navigation';
import './ChatHistory.css';
import { usePara } from '../SharedPara';
const ChatHistory = () => {
    const navigate = useNavigate();
    const { user, isVisitorMode, chatHistory, setChatHistory } = usePara();
    useEffect(() => {
        const savedChats = localStorage.getItem('careerCoachChatHistory' + user?.email);
        if (savedChats) {
            const parsedHistory = JSON.parse(savedChats);
            const sortedHistory = parsedHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setChatHistory(sortedHistory);
        } else {
            const sampleHistory = [

            ];
            setChatHistory(sampleHistory);
            localStorage.setItem('careerCoachChatHistory' + user?.email, JSON.stringify(sampleHistory));
        }
    }, []);

    const formatDate = (date) => {
        const formatedDate = new Date(date);

        const now = new Date();

        const diffInHours = Math.floor((now - formatedDate) / (1000 * 60 * 60));

        if (diffInHours < 24) {
            return diffInHours === 0 ? '刚刚' : `${diffInHours} 小时前`;
        } else {
            const diffInDays = Math.floor(diffInHours / 24);
            return diffInDays === 1 ? '1 天前' : `${diffInDays} 天前`;
        }
    };

    const openChat = (sessionId) => {
        navigate(`/chat?session=${sessionId}`);
    };

    const deleteChat = (sessionId) => {
        if (window.confirm('确定要删除此会话吗？此操作不可恢复。')) {
            localStorage.removeItem(`chatHistory_${sessionId}`);
            const updatedHistory = chatHistory.filter(chat => chat.id !== sessionId);
            setChatHistory(updatedHistory);
            localStorage.setItem('careerCoachChatHistory' + user?.email, JSON.stringify(updatedHistory));

            const currentSession = localStorage.getItem('currentChatSession');
            console.log(currentSession);
            if (currentSession === sessionId) {
                startNewChat();
            }
        }
    };

    const startNewChat = () => {
        const newSessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem('currentChatSession', newSessionId);
        navigate('/chat');
    };

    return (
        <div className="chat-history" role="main" aria-label="聊天历史记录页面">
            <Navigation


            />

            <main className="history-main" role="main" aria-labelledby="page-title">
                <div className="history-container">
                    <header className="history-header">
                        <h1 id="page-title">聊天历史</h1>
                        <p id="page-description">回顾您之前的职业辅导对话</p>

                        {chatHistory.length === 0 ? null :
                            <Link to="/chat"
                                className="new-chat-button"
                                onClick={startNewChat}
                                aria-label="开始新聊天"
                                role='button'
                                style={{ textDecoration: 'none' }}>
                                <span className="button-icon" aria-hidden="true">💬</span>
                                <span>开始新聊天</span>
                            </Link>}
                    </header>

                    {chatHistory.length === 0 ? (
                        <div className="empty-history"
                            role="status"
                            aria-live="polite"
                            aria-label="暂无聊天历史">
                            <div className="empty-icon" aria-hidden="true">📚</div>
                            <h2>暂无聊天历史</h2>
                            <p>与职业导师开始您的第一次对话，即可在此查看历史记录。</p>
                            <Link to="/chat" className="empty-action-button"
                                aria-label="开始第一次聊天" role='button'
                                style={{ textDecoration: 'none' }}>
                                开始您的第一次聊天
                            </Link>
                        </div>
                    ) : (
                        <div className="history-list"
                            role="list"
                            aria-label="聊天记录列表">
                            {chatHistory.map((chat) => (
                                <div key={chat.id} className="history-item"
                                    role="listitem">
                                    <div className="history-content" onClick={() => openChat(chat.id)}
                                        aria-label={`查看聊天: ${chat.title}`}>
                                        <div className="history-info">
                                            <h3 className="history-title">{chat.title}</h3>
                                            <p className="history-preview">{chat.lastMessage}</p>
                                            <div className="history-meta">
                                                <span className="message-count">{chat.messageCount} 条消息</span>
                                                <span className="timestamp">{formatDate(chat.timestamp)}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="history-actions"
                                        role="group"
                                        aria-label={`聊天记录操作：${chat.title}`}>
                                        <button
                                            className="view-chat-button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openChat(chat.id);
                                            }}
                                            aria-label={`查看聊天: ${chat.title}`}
                                        >
                                            <span className="action-icon" aria-hidden="true">👁️</span>
                                            <span>查看</span>
                                        </button>
                                        <button
                                            className="delete-chat-button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteChat(chat.id);
                                            }}
                                            aria-label={`删除聊天: ${chat.title}`}
                                        >
                                            <span className="action-icon" aria-hidden="true">🗑️</span>
                                            <span>删除</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="history-footer">
                        <p>
                            💡 <strong>提示：</strong> 您的聊天历史有助于追踪职业发展历程。
                            与职业导师定期对话可以提供长期的宝贵见解。
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ChatHistory;