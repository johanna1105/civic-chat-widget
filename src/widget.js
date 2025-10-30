(function(window, document) {
    'use strict';
    
    console.log('🚀 Civic Chat Widget loading...');
    
    // Einfache Utility Funktionen
    function $(selector) {
        return document.querySelector(selector);
    }
    
    function readData(el, key, fallback) {
        return el?.dataset?.[key] || fallback;
    }
    
    // Haupt Initialisierungsfunktion
    function init(options) {
        console.log('🎯 CivicChat init called', options);
        
        const el = options?.el || $('#civic-chat');
        if (!el) {
            console.warn('❌ No civic-chat element found');
            return;
        }
        
        console.log('✅ Found element:', el);
        
        // Erstelle einfachen Toggle Button
        const toggleBtn = document.createElement('button');
        toggleBtn.textContent = '💬';
        toggleBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: #2563eb;
            color: white;
            border: none;
            border-radius: 50%;
            font-size: 24px;
            cursor: pointer;
            z-index: 10000;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        
        // Erstelle Chat Container
        const chatContainer = document.createElement('div');
        chatContainer.style.cssText = `
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 350px;
            height: 500px;
            background: white;
            border: 1px solid #e1e5e9;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
            z-index: 10000;
            display: none;
            flex-direction: column;
        `;
        
        // Chat Header
        const header = document.createElement('div');
        header.style.cssText = `
            background: #2563eb;
            color: white;
            padding: 16px;
            border-radius: 12px 12px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        header.innerHTML = `
            <h3 style="margin: 0; font-size: 16px;">${readData(el, 'title', 'Civic Chat')}</h3>
            <button style="background: none; border: none; color: white; font-size: 20px; cursor: pointer;">×</button>
        `;
        
        // Messages Bereich
        const messages = document.createElement('div');
        messages.style.cssText = `
            flex: 1;
            padding: 16px;
            overflow-y: auto;
            background: #f8fafc;
        `;
        
        // Input Bereich
        const inputArea = document.createElement('div');
        inputArea.style.cssText = `
            padding: 16px;
            border-top: 1px solid #e1e5e9;
            display: flex;
            gap: 8px;
            background: white;
        `;
        inputArea.innerHTML = `
            <input type="text" placeholder="Type a message..." style="flex: 1; padding: 12px; border: 1px solid #d1d5db; border-radius: 8px;">
            <button style="background: #2563eb; color: white; border: none; padding: 12px 16px; border-radius: 8px; cursor: pointer;">Send</button>
        `;
        
        // Baue Chat zusammen
        chatContainer.appendChild(header);
        chatContainer.appendChild(messages);
        chatContainer.appendChild(inputArea);
        
        // Füge Elemente zum DOM hinzu
        document.body.appendChild(toggleBtn);
        document.body.appendChild(chatContainer);
        
        // Event Handler
        let isOpen = false;
        
        toggleBtn.addEventListener('click', function() {
            isOpen = !isOpen;
            chatContainer.style.display = isOpen ? 'flex' : 'none';
            console.log('Chat toggled:', isOpen);
        });
        
        header.querySelector('button').addEventListener('click', function() {
            isOpen = false;
            chatContainer.style.display = 'none';
        });
        
        const input = inputArea.querySelector('input');
        const sendBtn = inputArea.querySelector('button');
        
        function sendMessage() {
            const text = input.value.trim();
            if (!text) return;
            
            // User Message
            const userMsg = document.createElement('div');
            userMsg.textContent = text;
            userMsg.style.cssText = `
                background: #2563eb;
                color: white;
                padding: 12px;
                border-radius: 12px;
                margin: 8px 0;
                max-width: 80%;
                align-self: flex-end;
                border-bottom-right-radius: 4px;
            `;
            messages.appendChild(userMsg);
            
            input.value = '';
            
            // Bot Response (simuliert)
            setTimeout(() => {
                const botMsg = document.createElement('div');
                botMsg.textContent = 'Thanks for your message: ' + text;
                botMsg.style.cssText = `
                    background: white;
                    color: #334155;
                    padding: 12px;
                    border-radius: 12px;
                    margin: 8px 0;
                    max-width: 80%;
                    align-self: flex-start;
                    border: 1px solid #e1e5e9;
                    border-bottom-left-radius: 4px;
                `;
                messages.appendChild(botMsg);
                messages.scrollTop = messages.scrollHeight;
            }, 1000);
        }
        
        sendBtn.addEventListener('click', sendMessage);
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') sendMessage();
        });
        
        // Welcome Message
        setTimeout(() => {
            const welcomeMsg = document.createElement('div');
            welcomeMsg.textContent = readData(el, 'welcomeMessage', 'Hello! How can I help you?');
            welcomeMsg.style.cssText = `
                background: white;
                color: #334155;
                padding: 12px;
                border-radius: 12px;
                margin: 8px 0;
                max-width: 80%;
                align-self: flex-start;
                border: 1px solid #e1e5e9;
                border-bottom-left-radius: 4px;
            `;
            messages.appendChild(welcomeMsg);
        }, 500);
        
        console.log('🎉 Civic Chat Widget initialized successfully!');
    }
    
    // Exportiere zur globalen Scope
    window.CivicChat = {
        init: init
    };
    
    console.log('✅ Civic Chat Widget loaded. Available as window.CivicChat');
    
})(window, document);