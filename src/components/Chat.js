import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './Chat.css';
import { usePara } from '../SharedPara';

// 系统提示模板
const SYSTEM_PROMPT_TEMPLATE = `
你是一位專業的殘疾人士職業導師，致力於為香港殘疾人士提供個人化的就業支援。你的任務是：
1. 分析香港用戶上傳的 CV（透過 RAG 檢索）和香港用戶問題。
2. 利用 Web Search 和 Web Scraping 技能，搜尋並抓取香港網路上與殘疾人士相關的最新就業資訊。
3. 結合 CV 資料、RAG 結果與抓取內容，產生結構化建議：
- 推薦 1-2 個適合香港殘疾人士的職位。
- 解釋為什麼適合（基於技能、經驗及香港殘疾人士相關的支援）。
- 提供具體行動步驟（包括申請連結、香港培訓資源或香港支援機構）。
4. 使用鼓勵、支持的語氣，避免任何偏見或歧視性語言。
5. 若資訊不足，建議使用者上傳 CV 或提供更多細節。
6. 所有建議應基於最新的可用數據，確保實用性和相關性。

當使用者輸入問題時，確保回應清晰、結構化。
`;

// NEW: 新增求职相关关键词数组，用于判断用户输入是否相关
const JOB_RELATED_KEYWORDS = [
  'job', 'jobs', 'career', 'careers', 'resume', 'cv', 'interview', 'employment', 'position', 'vacancy', 'apply', 'skill', 'skills',
  '求职', '职业', '简历', '面试', '就业', '职位', '招聘', '申请', '技能', '工作', '残疾人', 'disabled', 'support', 'guidance'
];

// NEW: 新增求职相关文件扩展名列表
const JOB_FILE_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt', '.rtf'];

// NEW: 新增求职相关网站域名列表
const JOB_WEBSITES = [
  'jobsdb.com', 'indeed.com', 'linkedin.com', 'gov.hk', 'labour.gov.hk', 'rehabilitation.gov.hk',
  'hk.jobs', 'ctgoodjobs.hk', 'jobmarket.com.hk', 'e-careers.hk'
];

// 模块级函数：加载指定会话
const loadSession = (sessionId, setCurrentSessionId, setMessages) => {
    if (!sessionId) {
        console.error('无效的会话ID');
        return;
    }
    setCurrentSessionId(sessionId);
    localStorage.setItem('currentChatSession', sessionId);

    try {
        const savedHistory = localStorage.getItem(`chatHistory_${sessionId}`);
        if (savedHistory) {
            const parsedHistory = JSON.parse(savedHistory);
            const updatedHistory = parsedHistory.map(msg => ({
                ...msg,
                timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
            }));
            setMessages(updatedHistory);
        } else {
            setMessages([]);
        }
    } catch (error) {
        console.error('加载会话失败:', error);
        setMessages([]);
    }
};

// Chat组件
const Chat = ({ sessionId }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [cvFile, setCvFile] = useState(null);
    const [urlInput, setUrlInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [currentSessionId, setCurrentSessionId] = useState(null);
    const [isVoiceInput, setIsVoiceInput] = useState(false);
    const messagesEndRef = useRef(null);
    const recognitionRef = useRef(null);
    const { user, formDataToSend: profileData } = usePara();
    // API配置
    const BASE_URL = "http://localhost:3001/api/v1";  // http://localhost:3001/api/v1  //https://719780a9.r28.cpolar.top/api/v1
    const API_KEY = "MYN1CKP-P6TMVVH-HRDDJTN-1VBNA85";
    const WORKSPACE_SLUG = "genai_hackathon";
    const HEADERS = {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
        Accept: "text/event-stream"
    };
    useEffect(() => {
        const uploadFile = async () => {
            const formData = profileData;
            if (!formData.has('file'))
                return;
            formData.append('addToWorkspaces', WORKSPACE_SLUG);
            formData.append('metadata', JSON.stringify({
                title: 'profile',
                docAuthor: "Unknown",
                description: `Uploaded file: profile`,
                docSource: "User Upload"
            }));

            try {
                const res = await axios.post(
                    `${BASE_URL}/document/upload`,
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${API_KEY}`,
                            "Content-Type": "multipart/form-data"
                        }
                    }
                );
                if (res.status === 200) {
                    const fileId = res.data?.id || `file-${Date.now()}.json`;
                    await moveFile(fileId, `memory/${fileId}`);
                    setMessages(prev => [...prev, { role: 'user', content: `文件已上传并移动到记忆: ${cvFile.name}`, timestamp: new Date() }]);
                    alert("文件上传并移动到记忆成功！");
                } else {
                    alert("上传失败：" + (res.data?.message || '未知错误'));
                }
            } catch (error) {
                alert("网络错误：" + error.message);
            } finally {
                setUploadLoading(false);
                setCvFile(null);
            }
        }
        uploadFile();
    }, []);
    // 生成系统提示
    const generateSystemPrompt = () => {
        return SYSTEM_PROMPT_TEMPLATE;
    };

    // 生成会话标题
    const generateSessionTitle = useCallback((history) => {
        const firstUserMessage = history.find(msg => msg.role === 'user');
        if (firstUserMessage) {
            return firstUserMessage.content.substring(0, 30).replace(/@agent /, '') + '...';
        }
        return '新职业辅导会话';
    }, []);

    // 更新全局聊天历史
    const updateGlobalChatHistory = useCallback(() => {
        try {
            const globalHistory = JSON.parse(localStorage.getItem('careerCoachChatHistory' + user?.email) || '[]');
            const sessionHistory = messages;

            const currentSession = {
                id: currentSessionId,
                title: generateSessionTitle(sessionHistory),
                lastMessage: sessionHistory.length > 0 ? sessionHistory[sessionHistory.length - 1].content.substring(0, 50) + '...' : '新会话',
                timestamp: new Date(),
                messageCount: sessionHistory.length
            };

            const filteredHistory = globalHistory.filter(chat => chat.id !== currentSessionId);
            const updatedHistory = [currentSession, ...filteredHistory];

            localStorage.setItem('careerCoachChatHistory' + user?.email, JSON.stringify(updatedHistory));
        } catch (error) {
            console.error('更新全局历史失败:', error);
        }
    }, [messages, currentSessionId, generateSessionTitle]);

    // 初始化会话ID
    useEffect(() => {
        let initialSessionId = null;
        const currentChatId = sessionId || localStorage.getItem('currentChatSession');
        if (currentChatId) {
            initialSessionId = currentChatId;
        } else {
            const newSessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            localStorage.setItem('currentChatSession', newSessionId);
            initialSessionId = newSessionId;
        }

        setCurrentSessionId(initialSessionId);
    }, [user, sessionId]);

    // 加载会话历史
    useEffect(() => {
        if (!currentSessionId) return;
        loadSession(currentSessionId, setCurrentSessionId, setMessages);
    }, [currentSessionId]);

    // 保存会话历史
    useEffect(() => {
        if (!currentSessionId || messages.length === 0) return;
        localStorage.setItem(`chatHistory_${currentSessionId}`, JSON.stringify(messages));
        updateGlobalChatHistory();
    }, [messages, currentSessionId, updateGlobalChatHistory]);

    // 滚动到底部
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 语音输入
    const startVoiceInput = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.lang = 'zh-CN';//can change according to the region
            recognitionRef.current.interimResults = false;
            recognitionRef.current.maxAlternatives = 1;

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setInput(transcript);
                setIsVoiceInput(false);
                recognitionRef.current.stop();
            };

            recognitionRef.current.onerror = (event) => {
                console.error('语音识别错误:', event.error);
                setIsVoiceInput(false);
                alert('语音识别失败，请重试。');
            };

            recognitionRef.current.onend = () => {
                setIsVoiceInput(false);
            };

            recognitionRef.current.start();
            setIsVoiceInput(true);
        } else {
            alert('您的浏览器不支持语音输入，请使用 Chrome 或 Edge。');
        }
    };

    // 停止语音输入
    const stopVoiceInput = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsVoiceInput(false);
        }
    };

    // 读取文件内容（原有二进制，用于附件）
    const readFileContent = (file) => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result.split(',')[1]);
            reader.readAsDataURL(file);
        });
    };

    // NEW: 新增函数 - 读取文件作为文本，用于内容检查
    const readFileContentAsText = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file, 'utf-8');
        });
    };

    // 上传CV/文件（修改后）
    const uploadCV = async () => {
        if (!cvFile) {
            alert("请选择文件！");
            return;
        }

        // NEW: 检查文件扩展名是否求职相关
        const fileExtension = '.' + cvFile.name.split('.').pop().toLowerCase();
        if (!JOB_FILE_EXTENSIONS.includes(fileExtension)) {
            alert(`不支持的文件格式！请上传求职相关文件（${JOB_FILE_EXTENSIONS.join(', ')}）`);
            setCvFile(null);
            return;
        }

        // NEW: 对于文本文件，检查内容是否包含求职关键词
        if (fileExtension === '.txt' || fileExtension === '.rtf') {
            try {
                const content = await readFileContentAsText(cvFile);
                const lowerContent = content.toLowerCase();
                const isRelated = JOB_RELATED_KEYWORDS.some(keyword => lowerContent.includes(keyword.toLowerCase()));
                if (!isRelated) {
                    alert('文件内容不像是求职简历！请确保包含技能、经验或职位相关信息。');
                    setCvFile(null);
                    return;
                }
            } catch (error) {
                console.warn('无法读取文件内容，跳过检查:', error);
            }
        }

        setUploadLoading(true);
        const formData = new FormData();
        formData.append('file', cvFile);
        formData.append('addToWorkspaces', WORKSPACE_SLUG);
        formData.append('metadata', JSON.stringify({
            title: cvFile.name,
            docAuthor: "Unknown",
            description: `Uploaded file: ${cvFile.name}`,
            docSource: "User Upload"
        }));

        try {
            const res = await axios.post(
                `${BASE_URL}/document/upload`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${API_KEY}`,
                        "Content-Type": "multipart/form-data"
                    }
                }
            );
            if (res.status === 200) {
                const fileId = res.data?.id || `file-${Date.now()}.json`;
                await moveFile(fileId, `memory/${fileId}`);
                setMessages(prev => [...prev, { role: 'user', content: `文件已上传并移动到记忆: ${cvFile.name}`, timestamp: new Date() }]);
                alert("文件上传并移动到记忆成功！");
            } else {
                alert("上传失败：" + (res.data?.message || '未知错误'));
            }
        } catch (error) {
            alert("网络错误：" + error.message);
        } finally {
            setUploadLoading(false);
            setCvFile(null);
        }
    };

    // 上传URL（修改后）
    const uploadURL = async () => {
        if (!urlInput.trim()) {
            alert("请输入有效的 URL！");
            return;
        }

        const url = urlInput.trim();

        // NEW: 检查URL域名是否求职相关
        try {
            const urlObj = new URL(url);
            const hostname = urlObj.hostname.toLowerCase();
            const isValidDomain = JOB_WEBSITES.some(site => hostname.includes(site.toLowerCase()));
            if (!isValidDomain) {
                alert(`不支持的网站域名！请使用求职相关网站，如 ${JOB_WEBSITES.slice(0, 3).join(', ')} 等。当前域名: ${hostname}`);
                return;
            }
        } catch (error) {
            alert("无效的URL格式！");
            return;
        }

        // NEW: 可选 - 预检查页面标题是否求职相关（使用HEAD请求）
        try {
            const checkResponse = await fetch(url, { method: 'HEAD' });
            const title = checkResponse.headers.get('title') || '';  // 假设标题在header中，如果不可靠，可跳过或用GET
            const lowerTitle = title.toLowerCase();
            const isRelated = JOB_RELATED_KEYWORDS.some(keyword => lowerTitle.includes(keyword.toLowerCase()));
            if (!isRelated && title) {
                alert('页面标题不像是求职相关内容！请确认是职位或资源链接。');
                setUploadLoading(false);
                return;
            }
        } catch (error) {
            console.warn('无法预检查URL标题，继续上传:', error);
        }

        setUploadLoading(true);
        const payload = {
            link: urlInput,
            addToWorkspaces: WORKSPACE_SLUG,
            scraperHeaders: {
                Authorization: "Bearer token123",
                "My-Custom-Header": "value"
            },
            metadata: {
                title: `URL: ${urlInput}`,
                docAuthor: "Unknown",
                description: `Uploaded URL: ${urlInput}`,
                docSource: "User Upload"
            }
        };

        try {
            const res = await axios.post(
                `${BASE_URL}/document/upload-link`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${API_KEY}`,
                        "Content-Type": "application/json",
                        Accept: "application/json"
                    }
                }
            );
            if (res.status === 200) {
                const fileId = res.data?.id || `url-${Date.now()}.json`;
                await moveFile(fileId, `memory/${fileId}`);
                setMessages(prev => [...prev, { role: 'user', content: `URL 已上传并移动到记忆: ${urlInput}`, timestamp: new Date() }]);
                alert("URL 上传并移动到记忆成功！");
                setUrlInput('');
            } else {
                alert("上传失败：" + (res.data?.message || '未知错误'));
            }
        } catch (error) {
            alert("网络错误：" + error.message);
        } finally {
            setUploadLoading(false);
        }
    };

    // 移动文件/URL到记忆
    const moveFile = async (fromId, toPath) => {
        const payload = {
            files: [{ from: `custom-documents/${fromId}`, to: toPath }]
        };
        try {
            const res = await axios.post(
                `${BASE_URL}/document/move-files`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${API_KEY}`,
                        "Content-Type": "application/json",
                        Accept: "application/json"
                    }
                }
            );
            if (res.status !== 200) {
                console.warn("文件移动失败:", res.data);
            }
        } catch (error) {
            console.error("移动文件错误:", error);
        }
    };

    // 发送消息（流式传输） with hidden timestamp
    const sendMessage = async () => {
        if (!input.trim() || !currentSessionId) return;

        const originalInput = input.trim();
        const now = new Date().toLocaleString('zh-HK', {
            timeZone: 'Asia/Hong_Kong',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        }).replace(/(\d+)\/(\d+)\/(\d+), (\d+):(\d+) (上午|下午)/, '$3-$2-$1 $4:$5 $6');
        const agentMsg = `@agent [${now}] ${input.trim()}`;
        const timestamp = new Date();

        // Check for time-related query
        const isTimeQuery = originalInput.toLowerCase() === 'what time is it?' || originalInput.toLowerCase() === '现在几点?' || originalInput.toLowerCase() === '幾點了?' || originalInput.toLowerCase() === 'what is the time now?';
        if (isTimeQuery) {
            const currentTime = new Date().toLocaleString('zh-HK', {
                timeZone: 'Asia/Hong_Kong',
                hour12: false,
                hour: '2-digit',
                minute: '2-digit'
            });
            setMessages(prev => [
                ...prev,
                { role: 'user', content: originalInput, timestamp },
                { role: 'ai', content: `現在是香港時間 ${currentTime}。`, isMarkdown: true, timestamp: new Date(), id: `ai_${Date.now()}` }
            ]);
            setInput('');
            setIsLoading(false);
            return;
        }

        // MODIFIED: 添加求职相关判断开始
        // 检查输入是否包含求职相关关键词（忽略大小写）
        const lowerInput = originalInput.toLowerCase();
        const isJobRelated = JOB_RELATED_KEYWORDS.some(keyword => lowerInput.includes(keyword.toLowerCase()));
        if (!isJobRelated) {
            setMessages(prev => [
                ...prev,
                { role: 'user', content: originalInput, timestamp },
                { role: 'ai', content: '抱歉，我只能回答与求职相关的话题。请描述您的技能、职位推荐或职业问题。', isMarkdown: true, timestamp: new Date(), id: `ai_${Date.now()}` }
            ]);
            setInput('');
            setIsLoading(false);
            return; // 不继续发送到 API
        }
        // MODIFIED: 添加求职相关判断结束

        setMessages(prev => [...prev, { role: 'user', content: originalInput, timestamp }]);
        setInput('');
        setIsLoading(true);

        let attachmentContent = '';
        if (cvFile) {
            attachmentContent = await readFileContent(cvFile);
        }

        // 生成系统提示
        const systemPrompt = generateSystemPrompt();

        // 准备上下文：前10条消息
        const contextMessages = messages.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content
        }));

        // 合并系统提示和上下文到消息
        const contextText = contextMessages.map(m => `${m.role}: ${m.content}`).join('\n');
        const fullMessage = `${systemPrompt}\n\n${contextText}\nuser: ${agentMsg}`;

        const payload = {
            message: fullMessage,
            mode: "chat",
            sessionId: currentSessionId,
            attachments: cvFile
                ? [
                    {
                        name: cvFile.name,
                        mime: cvFile.type || "application/octet-stream",
                        contentString: attachmentContent
                    }
                ]
                : [],
            reset: false
        };

        try {
            // 使用 fetch 处理流式响应
            const response = await fetch(`${BASE_URL}/workspace/${WORKSPACE_SLUG}/stream-chat`, {
                method: 'POST',
                headers: HEADERS,
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`HTTP 错误: ${response.status} ${response.statusText}`);
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let aiContent = '';
            const aiMessageId = `ai_${Date.now()}`;
            setMessages(prev => [...prev, { role: 'ai', content: '', isMarkdown: true, timestamp: new Date(), id: aiMessageId }]);

            while (true) {
                const { done, value } = await reader.read();
                if (done) {
                    setIsLoading(false);
                    break;
                }

                const chunk = decoder.decode(value, { stream: true });
                console.log('原始流数据:', chunk);

                // 按行处理流数据
                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6);
                        if (data === '[DONE]') {
                            setIsLoading(false);
                            break;
                        }
                        try {
                            const parsed = JSON.parse(data);
                            const text = parsed.textResponse || '';
                            aiContent += text;
                            setMessages(prev =>
                                prev.map(msg =>
                                    msg.id === aiMessageId ? { ...msg, content: aiContent } : msg
                                )
                            );
                            scrollToBottom();
                        } catch (error) {
                            console.error('解析流数据失败:', error, '原始数据:', data);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('聊天错误:', error);
            setMessages(prev => [
                ...prev,
                { role: 'ai', content: `**聊天失败**：${error.message}`, isMarkdown: true, timestamp: new Date() }
            ]);
            setIsLoading(false);
        } finally {
            setCvFile(null);
        }
    };

    // 回车发送
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // 格式化时间
    const formatTime = (date) => {
        if (!date) return '未知时间';
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    // 渲染消息内容
    const renderMessageContent = (content, isMarkdown) => {
        if (!isMarkdown) return <span>{content}</span>;
        return (
            <ReactMarkdown
                components={{
                    strong: ({ children }) => <strong>{children}</strong>,
                    code: ({ children }) => <code>{children}</code>,
                    pre: ({ children }) => <pre>{children}</pre>,
                    ul: ({ children }) => <ul>{children}</ul>,
                    li: ({ children }) => <li>{children}</li>
                }}
            >
                {content}
            </ReactMarkdown>
        );
    };

    // 新会话按钮
    const startNewSession = () => {
        const newSessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        setCurrentSessionId(newSessionId);
        localStorage.setItem('currentChatSession', newSessionId);
        setMessages([]);
        setInput('');
        setCvFile(null);
        setUrlInput('');
    };

    return (
        <div className="chat" role="main">
            <main className="chat-main">
                <div className="chat-container">
                    {/* header */}
                    <header className="chat-header">
                        <div className="header-actions">
                            <Link to="/dashboard" className="home-btn"
                                aria-label="返回首页" title="返回应用主页面"
                                style={{ textDecoration: 'none' }}>
                                <span aria-hidden="true">🏠</span>
                                <span className="sr-only">返回</span>
                                首页
                            </Link>
                            {/* 隐藏的描述元素 */}
                            <div id="new-session-description" className="sr-only">
                                点击此按钮将返回首页，当前对话历史将被保存
                            </div>
                            <h1>残疾人士职业辅导聊天</h1>
                            <button className="new-session-btn" onClick={startNewSession} disabled={isLoading}
                                aria-label={isLoading ? "正在处理，请稍后" : "开始新的聊天会话"}
                                aria-describedby="new-session-description">
                                <span aria-hidden="true">➕</span>
                                新聊天
                            </button>
                            {/* 隐藏的描述元素 */}
                            <div id="new-session-description" className="sr-only">
                                点击此按钮将开始一个新的聊天会话，当前对话历史将被保存
                            </div>
                        </div>
                        <p id="chat-description">专业的导师支持，推荐适合您的职位和资源</p>
                    </header>
                    {/* message area */}
                    <section
                        className="messages-container"
                        aria-live="polite"
                        aria-atomic="false"
                        aria-relevant="additions"
                        aria-label="聊天消息"
                        aria-describedby="chat-description"
                    >
                        <div
                            role="list"
                            aria-label="消息列表"
                        >
                            {messages.map((msg, idx) => (
                                <article
                                    key={msg.id || idx}
                                    className={`message ${msg.role} ${msg.content === '' && msg.role === 'ai' ? 'streaming' : ''}`}
                                    aria-label={msg.role === 'user' ? '用户消息' : 'AI消息'}
                                    role="listitem"
                                >
                                    <div className="message-avatar" aria-hidden="true">
                                        {msg.role === 'user' ? '👤' : '🤖'}
                                    </div>
                                    <div className="message-content">
                                        <div className="message-bubble">
                                            {renderMessageContent(msg.content, msg.isMarkdown)}
                                        </div>
                                        <time className="message-time" dateTime={new Date(msg.timestamp).toISOString()}>{formatTime(msg.timestamp)}</time>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* loading status */}
                        {(isLoading || uploadLoading) && (
                            <div className="message bot streaming"
                                role="status"
                                aria-live="polite"
                                aria-label="AI正在输入消息">
                                <div className="message-avatar" aria-hidden="true">🤖</div>
                                <div className="message-content">
                                    <div className="message-bubble typing">
                                        <p>正在为您分析...（导师模式）</p>
                                        <div className="typing-indicator" aria-hidden="true">
                                            <span></span>
                                            <span></span>
                                            <span></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} aria-hidden="true" />
                    </section>

                    {/* input area */}
                    <section className="message-form" aria-label="消息输入">
                        <div className="input-container" role="group" aria-labelledby="file-upload-label">
                            <label id="file-upload-label" className="sr-only">
                                文件上传
                            </label>

                            <input
                                type="file"
                                accept=".pdf,.doc,.docx,.txt,.png,.jpg"
                                onChange={(e) => setCvFile(e.target.files[0])}
                                className="file-input"
                                aria-label="上传CV 推荐上传您的简历"
                                disabled={uploadLoading || isLoading || isVoiceInput}
                                aria-describedby="file-upload-help"
                            />

                            <button
                                className="upload-btn"
                                onClick={uploadCV}
                                disabled={uploadLoading || isLoading || !cvFile || isVoiceInput}
                                aria-label={cvFile ? `上传文件: ${cvFile.name}` : "请选择要上传的文件"}
                            >
                                上传CV
                            </button>
                            <label id="url-input-label" className="sr-only">
                                就业资源URL
                            </label>
                            <input
                                type="text"
                                value={urlInput}
                                onChange={(e) => setUrlInput(e.target.value)}
                                placeholder="输入就业资源URL"
                                aria-label="输入URL"
                                aria-describedby="url-input-help"
                                disabled={uploadLoading || isLoading || isVoiceInput}
                            />
                            <button
                                className="upload-url-btn"
                                onClick={uploadURL}
                                disabled={uploadLoading || isLoading || !urlInput.trim() || isVoiceInput}
                                aria-label="上传URL"
                            >
                                上传URL
                            </button>
                            <label id="message-input-label" className="sr-only">
                                输入您的消息
                            </label>
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={isVoiceInput ? "正在监听..." : "描述您的技能或问题（如：推荐软件开发职位）"}
                                disabled={uploadLoading || isLoading || isVoiceInput}
                                aria-label="输入问题"
                                aria-required="true"
                                aria-describedby="message-input-help"
                            />
                            <button
                                className={`voice-btn ${isVoiceInput ? 'active' : ''}`}
                                onClick={isVoiceInput ? stopVoiceInput : startVoiceInput}
                                disabled={uploadLoading || isLoading}
                                aria-pressed={isVoiceInput}
                                aria-label={isVoiceInput ? '停止语音输入' : '开始语音输入'}
                                aria-describedby="voice-input-help"
                            >
                                <span aria-hidden="true">{isVoiceInput ? '⏹️' : '🎤'}</span>
                                <span className="sr-only">{isVoiceInput ? '停止' : '语音'}</span>
                            </button>
                            <button
                                className="send-btn"
                                onClick={sendMessage}
                                disabled={uploadLoading || isLoading || isVoiceInput || !input.trim()}
                                aria-label="发送"
                            >
                                <span aria-hidden="true">📤</span>
                                <span className="sr-only">发送</span>
                            </button>
                            <button
                                className="clear-btn"
                                onClick={() => {
                                    setMessages([]);
                                }}
                                disabled={isLoading}
                                aria-label="清空当前会话"
                                aria-describedby="clear-session-help"
                            >
                                清空所有会话
                            </button>
                        </div>
                    </section>
                    {/* 帮助文本 */}
                    <div className="help-texts sr-only" >
                        <p id="file-upload-help" className="help-text">
                            支持 PDF, Word, 文本, 图片格式文件
                        </p>
                        <p id="url-input-help" className="help-text">
                            输入就业相关网页链接
                        </p>
                        <p id="message-input-help" className="help-text">
                            描述您的职业技能、需求或问题
                        </p>
                        <p id="voice-input-help" className="help-text">
                            点击麦克风按钮进行语音输入
                        </p>
                        <p id="clear-session-help" className="help-text">
                            清空当前聊天记录，不会影响已保存的会话
                        </p>
                    </div>
                </div>
            </main >
        </div >
    );
};

export { loadSession };
export default Chat;