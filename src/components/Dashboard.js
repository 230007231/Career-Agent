import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from './Navigation';
import './Dashboard.css';
import { usePara } from '../SharedPara';

const Dashboard = () => {
    const { user, isVisitorMode } = usePara();
    return (
        <div className="dashboard">
            <Navigation



            />

            <main className="dashboard-main" role="main" aria-label='主选择区'>
                <div className="dashboard-content">
                    <h1 id="dashboard-title">欢迎来到您的专属职业导师</h1>
                    <p className="dashboard-subtitle">
                        获得根据您的独特需求和目标量身定制的个性化职业指导和支持。
                    </p>

                    <div className="dashboard-actions" role="group" aria-label="功能选择">
                        <Link to="/chat" className="action-button primary" aria-label="开始对话">
                            <span className="button-icon" aria-hidden="true">💬</span>
                            <span className="button-text">开始对话</span>
                        </Link>

                        <Link to="/history" className="action-button secondary" aria-label="查看对话历史">
                            <span className="button-icon" aria-hidden="true">📚</span>
                            <span className="button-text">查看对话历史</span>
                        </Link>
                    </div>

                    <div className="features-section">
                        <h2>今天我能为您做些什么？</h2>

                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
