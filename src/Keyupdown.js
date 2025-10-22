import React, { useEffect, useRef, useState } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Chat from './components/Chat';
import ChatHistory from './components/ChatHistory';
import Profile from './components/Profile';
import { usePara } from './SharedPara';

const Keyupdown = ({ elements, page, sessionId }) => {
    const selectedElementsRef = useRef([]);
    const { showProfileMenu, isEditing, chatHistory } = usePara();

    useEffect(() => {
        selectedElementsRef.current = Array.from(
            document.querySelectorAll(elements)//'.history-item, .new-chat-button, .empty-action-button')
        ).filter(el => el.offsetParent !== null);

    }, [showProfileMenu, page, isEditing, chatHistory]);
    useEffect(() => {
        if (selectedElementsRef.current.length > 0) {
            selectedElementsRef.current[0].focus();
        }
    }, []);
    useEffect(() => {
        const handleKeyDown = (event) => {
            const focusableElementsRef = [...selectedElementsRef.current.filter(el => !el.disabled)];
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                const currentIndex = focusableElementsRef.indexOf(document.activeElement);
                let nextIndex;
                if (currentIndex === -1) {
                    nextIndex = 0;
                } else {
                    if (event.key === 'ArrowDown') {
                        nextIndex = (currentIndex + 1) % focusableElementsRef.length;
                    } else {
                        nextIndex = (currentIndex - 1 + focusableElementsRef.length) % focusableElementsRef.length;
                    }
                }
                focusableElementsRef[nextIndex]?.focus();
            } else if (event.key === 'Enter') {
                event.preventDefault();
                const activeElement = document.activeElement;
                if (activeElement) {

                    if (activeElement.tagName === 'SELECT') {
                        if (activeElement.options.length > 0) {
                            activeElement.selectedIndex =
                                (activeElement.selectedIndex + 1) %
                                activeElement.options.length;  // 选中第一个选项
                        }
                        const changeEvent = new Event('change', { bubbles: true });
                        activeElement.dispatchEvent(changeEvent);

                    }
                    else
                        activeElement.click();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [page]);
    return (
        <div className="page-container">
            {page === 'dashboard' && (
                <Dashboard


                />
            )}
            {
                page === 'chat' && (
                    <Chat
                        sessionId={sessionId}
                    />
                )
            }
            {
                page === 'chatHistory' && (
                    <ChatHistory
                    />
                )
            }
            {
                page === 'profile' && (
                    <Profile


                    />
                )
            }
            {
                page === 'login' && (
                    <Login />
                )
            }
        </div >



    );
}

export default Keyupdown;