import React from 'react';
import ReactDOM from 'react-dom/client';
import './App.css';
import App from './App';
import { ParaProvider } from './SharedPara';

const root = ReactDOM.createRoot(document.getElementById('root'));


root.render(
    <ParaProvider>
        <React.StrictMode>
            <App />
        </React.StrictMode>
    </ParaProvider>
);
