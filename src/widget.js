(function(window, document) {
    'use strict';
    
    console.log('Civic Chat Widget loading...');
    
    function $(selector) {
        return document.querySelector(selector);
    }
    
    function readData(el, key, fallback) {
        return el?.dataset?.[key] || fallback;
    }
    
    function init(options) {
        console.log('CivicChat init called', options);
        
        const el = options?.el || $('#civic-chat');
        if (!el) {
            console.warn('No civic-chat element found');
            return;
        }
        
        console.log('Found element:', el);
        
        const chatContainer = document.createElement('div');
        chatContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 350px;
            max-width: 90vw;
            height: 500px;
            max-height: 70vh;
            background: white;
            border: 1px solid #e1e5e9;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            z-index: 10000;
            display: flex;
            flex-direction: column;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            transition: all 0.3s ease;
        `;
        
        const header = document.createElement('div');
        header.style.cssText = `
            background: #2563eb;
            color: white;
            padding: 16px;
            border-radius: 12px 12px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-shrink: 0;
            cursor: move;
        `;
        header.innerHTML = `
            <h3 style="margin: 0; font-size: 16px; font-weight: 600;">${readData(el, 'title', 'Civic Chat')}</h3>
            <div style="display: flex; gap: 8px;">
                <button style="background: none; border: none; color: white; font-size: 16px; cursor: pointer; padding: 4px; border-radius: 4px;" aria-label="Minimize chat">−</button>
                <button style="background: none; border: none; color: white; font-size: 16px; cursor: pointer; padding: 4px; border-radius: 4px;" aria-label="Close chat">×</button>
            </div>
        `;
        
        const messages = document.createElement('div');
        messages.style.cssText = `
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            background: #f8fafc;
            display: flex;
            flex-direction: column;
            gap: 8px;
        `;
        
        const inputArea = document.createElement('div');
        inputArea.style.cssText = `
            padding: 16px;
            border-top: 1px solid #e1e5e9;
            display: flex;
            gap: 8px;
            background: white;
            flex-shrink: 0;
        `;
        inputArea.innerHTML = `
            <input type="text" placeholder="Type a message..." style="
                flex: 1; 
                padding: 12px; 
                border: 1px solid #d1d5db; 
                border-radius: 8px;
                font-size: 14px;
                font-family: inherit;
                outline: none;
            ">
            <button style="
                background: #2563eb; 
                color: white; 
                border: none; 
                padding: 12px 16px; 
                border-radius: 8px; 
                cursor: pointer;
                font-size: 14px;
                font-family: inherit;
                font-weight: 500;
            ">Send</button>
        `;
        
        chatContainer.appendChild(header);
        chatContainer.appendChild(messages);
        chatContainer.appendChild(inputArea);
        
        document.body.appendChild(chatContainer);
        
        let isMinimized = false;
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };
        
        function toggleMinimize() {
            isMinimized = !isMinimized;
            if (isMinimized) {
                messages.style.display = 'none';
                inputArea.style.display = 'none';
                chatContainer.style.height = 'auto';
                chatContainer.style.width = '250px';
            } else {
                messages.style.display = 'flex';
                inputArea.style.display = 'flex';
                chatContainer.style.height = '500px';
                chatContainer.style.width = '350px';
                setTimeout(() => {
                    inputArea.querySelector('input').focus();
                }, 100);
            }
        }
        
        function closeChat() {
            chatContainer.style.display = 'none';
        }
        
        header.addEventListener('mousedown', startDrag);
        
        function startDrag(e) {
            if (e.target.tagName === 'BUTTON') return; 
            isDragging = true;
            dragOffset.x = e.clientX - chatContainer.getBoundingClientRect().left;
            dragOffset.y = e.clientY - chatContainer.getBoundingClientRect().top;
            
            document.addEventListener('mousemove', onDrag);
            document.addEventListener('mouseup', stopDrag);
        }
        
        function onDrag(e) {
            if (!isDragging) return;
            
            const x = e.clientX - dragOffset.x;
            const y = e.clientY - dragOffset.y;
            
            const maxX = window.innerWidth - chatContainer.offsetWidth;
            const maxY = window.innerHeight - chatContainer.offsetHeight;
            
            chatContainer.style.left = Math.max(0, Math.min(x, maxX)) + 'px';
            chatContainer.style.top = Math.max(0, Math.min(y, maxY)) + 'px';
            chatContainer.style.right = 'auto';
            chatContainer.style.bottom = 'auto';
        }
        
        function stopDrag() {
            isDragging = false;
            document.removeEventListener('mousemove', onDrag);
            document.removeEventListener('mouseup', stopDrag);
        }
        
        const minimizeBtn = header.querySelector('button:nth-child(1)');
        const closeBtn = header.querySelector('button:nth-child(2)');
        
        minimizeBtn.addEventListener('click', toggleMinimize);
        closeBtn.addEventListener('click', closeChat);
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeChat();
            }
        });
        
        const input = inputArea.querySelector('input');
        const sendBtn = inputArea.querySelector('button');
        
        function sendMessage() {
            const text = input.value.trim();
            if (!text) return;
            
            const userMsg = document.createElement('div');
            userMsg.textContent = text;
            userMsg.style.cssText = `
                background: #2563eb;
                color: white;
                padding: 12px 16px;
                border-radius: 12px;
                margin: 4px 0;
                max-width: 80%;
                align-self: flex-end;
                border-bottom-right-radius: 4px;
                font-size: 14px;
                line-height: 1.4;
                word-wrap: break-word;
            `;
            messages.appendChild(userMsg);
            
            input.value = '';
            
            const typingIndicator = document.createElement('div');
            typingIndicator.textContent = 'Typing...';
            typingIndicator.style.cssText = `
                background: white;
                color: #64748b;
                padding: 8px 12px;
                border-radius: 12px;
                margin: 4px 0;
                max-width: 80%;
                align-self: flex-start;
                border: 1px solid #e1e5e9;
                border-bottom-left-radius: 4px;
                font-size: 12px;
                font-style: italic;
            `;
            messages.appendChild(typingIndicator);
            messages.scrollTop = messages.scrollHeight;
            
            setTimeout(() => {
                typingIndicator.remove();
                
                const botMsg = document.createElement('div');
                botMsg.textContent = 'Thanks for your message: "' + text + '". This is an automated response from the Civic Chat Widget!';
                botMsg.style.cssText = `
                    background: white;
                    color: #334155;
                    padding: 12px 16px;
                    border-radius: 12px;
                    margin: 4px 0;
                    max-width: 80%;
                    align-self: flex-start;
                    border: 1px solid #e1e5e9;
                    border-bottom-left-radius: 4px;
                    font-size: 14px;
                    line-height: 1.4;
                    word-wrap: break-word;
                `;
                messages.appendChild(botMsg);
                messages.scrollTop = messages.scrollHeight;
            }, 1500);
        }
        
        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendMessage();
        });
        
        setTimeout(() => {
            const welcomeMsg = document.createElement('div');
            welcomeMsg.textContent = readData(el, 'welcomeMessage', 'Hello! How can I help you today?');
            welcomeMsg.style.cssText = `
                background: white;
                color: #334155;
                padding: 12px 16px;
                border-radius: 12px;
                margin: 4px 0;
                max-width: 80%;
                align-self: flex-start;
                border: 1px solid #e1e5e9;
                border-bottom-left-radius: 4px;
                font-size: 14px;
                line-height: 1.4;
            `;
            messages.appendChild(welcomeMsg);
            messages.scrollTop = messages.scrollHeight;
            
            input.focus();
        }, 500);
        
        console.log('Civic Chat Widget initialized successfully!');
    }
    
    window.CivicChat = {
        init: init
    };
    
    console.log('Civic Chat Widget loaded. Available as window.CivicChat');
    
})(window, document);