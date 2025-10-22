import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import { usePara } from '../SharedPara';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [register, setRegister] = useState(false);
    const [welcome, setWelcome] = useState(false);
    const navigate = useNavigate();
    const { handleLogin } = usePara();
    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');

        // Basic email/password validation
        if (!email || !password) {
            setError('请输入邮箱和密码');
            return;
        }

        if (password.length < 6) {
            setError('密码长度必须至少为 6 个字符');
            return;
        }
        const savedinfoes = JSON.parse(localStorage.getItem('user' + email));
        if (savedinfoes) {
            if (savedinfoes.password === password) {
                setRegister(false);
                setWelcome(true);
                setError('');
                setTimeout(() => {
                    handleLogin(savedinfoes, false);
                }, 1500);


            }
            else {
                setError('密码错误');
                return;
            }
        }
        else {
            // Simple authentication (in a real app, this would connect to a backend)
            const userData = {
                name: email.split('@')[0],
                email: email,
                password: password
            };
            localStorage.setItem('user' + email, JSON.stringify(userData));

            setRegister(true);
            setWelcome(true);
            setError('');
            setTimeout(() => {
                handleLogin(userData, false);
            }, 1500);
        }
        /*setTimeout(() => {
            navigate('/dashboard');
        }, 1500);*/

    };

    const handleVisitorLogin = () => {
        // Immediately log in as visitor without confirmation
        handleLogin({ name: 'Visitor', email: 'visitor@guest.com' }, true);

    };
    return (
        <div className="login-container">
            <div className="login-box">
                <h1 style={{ padding: '10px' }} id='login-form-title'>职业导师</h1>

                <form onSubmit={handleSubmit} className="login-form" aria-labelledby="login-form-title">
                    <div className="form-group">
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="邮箱"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="密码"
                            aria-describedby="password-help"
                            required
                        />
                        <small id="password-help">至少需要 6 个字符</small>
                    </div>
                    {welcome && (register ?
                        <div className="registration welcome"
                            role="alert">注册成功！正在登录……</div> :
                        <div className="welcome" role="alert">欢迎回来！正在登录...</div>)}
                    {error && <div className="error-message" role="alert" aria-live="assertive">{error}</div>}

                    <button type="submit" className="login-button">
                        登入
                    </button>

                    <div className="divider">
                        <span>或</span>
                    </div>

                    <button
                        type="button"
                        className="visitor-button"
                        onClick={handleVisitorLogin}
                    >
                        以访客身份继续
                    </button>

                </form>
            </div>
        </div>
    );
};

export default Login;
