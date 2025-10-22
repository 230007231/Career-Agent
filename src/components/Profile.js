import React, { useState } from 'react';
import Navigation from './Navigation';
import './Profile.css';
import { usePara } from '../SharedPara';
const Profile = () => {
    const { isEditing, setIsEditing, user, isVisitorMode, handleUpdateUser,
        formDataToSend
    } = usePara();
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        location: user?.location || '',
        jobTitle: user?.jobTitle || '',
        company: user?.company || '',
        experience: user?.experience || '',
        skills: user?.skills || '',
        careerGoals: user?.careerGoals || '',
        bio: user?.bio || ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = () => {
        // Update user data
        const updatedUser = { ...user, ...formData };
        handleUpdateUser(updatedUser);
        localStorage.setItem('user' + updatedUser.email, JSON.stringify(updatedUser));
        setIsEditing(false);
        const fileContent = JSON.stringify(formData, null, 2); // 格式化为 JSON 字符串
        const blob = new Blob([fileContent], { type: 'application/json' });
        const file = new File([blob], 'formData.json');
        if (formDataToSend.has('file'))
            formDataToSend.delete('file');
        formDataToSend.append('file', file);
    };

    const handleCancel = () => {
        // Reset form data to original user data
        setFormData({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
            location: user?.location || '',
            jobTitle: user?.jobTitle || '',
            company: user?.company || '',
            experience: user?.experience || '',
            skills: user?.skills || '',
            careerGoals: user?.careerGoals || '',
            bio: user?.bio || ''
        });
        setIsEditing(false);
    };

    return (
        <div className="profile">
            <Navigation


                handleSave={handleSave}
            />

            <main className="profile-main" role="main" aria-labelledby="profile-title">
                <div className="profile-container">
                    <div className="profile-header">
                        <h1 id="profile-title">我的档案</h1>
                        {isVisitorMode && (
                            <div className="visitor-notice" role="alert" aria-live="assertive">
                                <span className="visitor-icon" aria-hidden="true">ℹ️</span>
                                <span>访客模式：个人资料更改不会永久保存</span>
                            </div>
                        )}
                        <div className="profile-actions">
                            {!isEditing ? (
                                <button
                                    className="edit-button"
                                    onClick={() => setIsEditing(true)}
                                    aria-label="编辑档案"
                                >
                                    <span className="button-icon" aria-hidden="true">✏️</span>
                                    编辑档案
                                </button>
                            ) : (
                                <div className="edit-actions">
                                    <button
                                        className="save-button"
                                        onClick={handleSave}
                                        aria-label="保存修改"
                                    >
                                        <span className="button-icon" aria-hidden="true">💾</span>
                                        保存修改
                                    </button>
                                    <button
                                        className="cancel-button"
                                        onClick={handleCancel}
                                        aria-label="取消修改"
                                    >
                                        <span className="button-icon" aria-hidden="true">❌</span>
                                        取消修改
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="profile-content">
                        <div className="profile-section">
                            <h2>基本信息</h2>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="name">名称</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            id="name"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleInputChange}
                                            placeholder="输入名称"

                                            aria-required="true"
                                        />
                                    ) : (
                                        <div className="form-display">{formData.name || '无输入'}</div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="email">电子邮箱</label>
                                    {isEditing ? (
                                        <input
                                            type="email"
                                            id="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleInputChange}
                                            placeholder="输入邮箱"
                                            aria-required="true"
                                        />
                                    ) : (
                                        <div className="form-display">{formData.email || '无输入'}</div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="phone">电话号码</label>
                                    {isEditing ? (
                                        <input
                                            type="tel"
                                            id="phone"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            placeholder="输入电话号码"
                                        />
                                    ) : (
                                        <div className="form-display">{formData.phone || '无输入'}</div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="location">地址</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            id="location"
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            placeholder="区/市/省"
                                        />
                                    ) : (
                                        <div className="form-display">{formData.location || '无输入'}</div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="profile-section">
                            <h2>专业信息</h2>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label htmlFor="jobTitle">当下工作名称</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            id="jobTitle"
                                            name="jobTitle"
                                            value={formData.jobTitle}
                                            onChange={handleInputChange}
                                            placeholder="例：软件工程师"
                                        />
                                    ) : (
                                        <div className="form-display">{formData.jobTitle || '无输入'}</div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="company">当下公司</label>
                                    {isEditing ? (
                                        <input
                                            type="text"
                                            id="company"
                                            name="company"
                                            value={formData.company}
                                            onChange={handleInputChange}
                                            placeholder="输入公司名称"
                                        />
                                    ) : (
                                        <div className="form-display">{formData.company || '无输入'}</div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="experience">从业时间</label>
                                    {isEditing ? (
                                        <select
                                            id="experience"
                                            name="experience"
                                            value={formData.experience}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">Select experience level</option>
                                            <option value="0-1">0-1 years</option>
                                            <option value="2-3">2-3 years</option>
                                            <option value="4-5">4-5 years</option>
                                            <option value="6-10">6-10 years</option>
                                            <option value="10+">10+ years</option>
                                        </select>
                                    ) : (
                                        <div className="form-display">{formData.experience || '无输入'}</div>
                                    )}
                                </div>
                            </div>

                            <div className="form-group full-width">
                                <label htmlFor="skills">技能 & 特长</label>
                                {isEditing ? (
                                    <textarea
                                        id="skills"
                                        name="skills"
                                        value={formData.skills}
                                        onChange={handleInputChange}
                                        rows="3"
                                        placeholder="列出您的关键技能，用逗号分隔"
                                    />
                                ) : (
                                    <div className="form-display">{formData.skills || '无输入'}</div>
                                )}
                            </div>
                        </div>

                        <div className="profile-section">
                            <h2>职业目标 & 个人简介</h2>
                            <div className="form-group full-width">
                                <label htmlFor="careerGoals">职业目标</label>
                                {isEditing ? (
                                    <textarea
                                        id="careerGoals"
                                        name="careerGoals"
                                        value={formData.careerGoals}
                                        onChange={handleInputChange}
                                        rows="3"
                                        placeholder="描述你的职业抱负和目标"
                                    />
                                ) : (
                                    <div className="form-display">{formData.careerGoals || '无输入'}</div>
                                )}
                            </div>

                            <div className="form-group full-width">
                                <label htmlFor="bio">个人简介</label>
                                {isEditing ? (
                                    <textarea
                                        id="bio"
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleInputChange}
                                        rows="4"
                                        placeholder="写一篇关于你自己的简短的专业总结"
                                    />
                                ) : (
                                    <div className="form-display">{formData.bio || '无输入'}</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;