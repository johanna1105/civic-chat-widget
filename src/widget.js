(function (window, document) {
    'use strict';

    // Utility functions
    function qs(selector, root = document) {
        return root.querySelector(selector);
    }

    function readData(el, key, fallback) {
        if (!el || !el.dataset) return fallback;
        const value = el.dataset[key];
        return value !== undefined ? value : fallback;
    }

    function generateId() {
        return 'civic-' + Math.random().toString(36).substr(2, 9);
    }

    // Configuration loader
    async function loadConfig(url) {
        try {
            const res = await fetch(url, { 
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json'
                }
            });
            if (!res.ok) throw new Error('Config load failed: ' + res.status);
            return await res.json();
        } catch (error) {
            console.warn('[CivicChat] Config load failed:', error);
            return {};
        }
    }

    // Consent management
    async function checkConsent(acceptUrl) {
        if (!acceptUrl || acceptUrl === 'false') return true;
        
        try {
            const res = await fetch(acceptUrl, {
                method: 'GET',
                credentials: 'same-origin'
            });
            return res.ok;
        } catch (error) {
            console.warn('[CivicChat] Consent check failed:', error);
            return false;
        }
    }

    // Style injection with nonce support
    function injectStyles(cssContent, nonce) {
        // Check if styles already injected
        if (document.querySelector('style[data-civic-chat]')) {
            return;
        }

        const style = document.createElement('style');
        style.setAttribute('data-civic-chat', '');
        if (nonce) style.setAttribute('nonce', nonce);
        style.textContent = cssContent;
        document.head.appendChild(style);
    }

    // Widget class
    function CivicChatWidget(options = {}) {
        this.options = options;
        this.id = generateId();
        this.isOpen = false;
        this.messages = [];
        this.ready = false;
        this.initialize();
    }

    CivicChatWidget.prototype.initialize = function() {
        this.createToggleButton();
        this.createWidget();
        this.bindEvents();
        this.loadInitialData();
    };

    CivicChatWidget.prototype.createToggleButton = function() {
        this.toggleButton = document.createElement('button');
        this.toggleButton.className = 'civic-chat__toggle';
        this.toggleButton.innerHTML = '💬';
        this.toggleButton.setAttribute('aria-label', 'Open chat');
        document.body.appendChild(this.toggleButton);
    };

    CivicChatWidget.prototype.createWidget = function() {
        // Create widget container
        this.container = document.createElement('div');
        this.container.className = 'civic-chat civic-chat--hidden';
        this.container.id = this.id;

        // Widget HTML structure
        this.container.innerHTML = `
            <div class="civic-chat__header">
                <h3 class="civic-chat__title">${this.options.title || 'Civic Chat'}</h3>
                <button class="civic-chat__close" aria-label="Close chat">×</button>
            </div>
            <div class="civic-chat__messages"></div>
            <div class="civic-chat__input-area">
                <input type="text" class="civic-chat__input" placeholder="Type your message..." />
                <button class="civic-chat__send">Send</button>
            </div>
            <div class="civic-chat__consent" style="display: none;">
                <p>You need to accept the chat terms to continue.</p>
                <button class="civic-chat__consent-button">Accept</button>
            </div>
        `;

        document.body.appendChild(this.container);
        
        // Cache DOM elements
        this.messagesContainer = qs('.civic-chat__messages', this.container);
        this.input = qs('.civic-chat__input', this.container);
        this.sendButton = qs('.civic-chat__send', this.container);
        this.closeButton = qs('.civic-chat__close', this.container);
        this.consentSection = qs('.civic-chat__consent', this.container);
        this.consentButton = qs('.civic-chat__consent-button', this.container);
    };

    CivicChatWidget.prototype.bindEvents = function() {
        this.sendButton.addEventListener('click', () => this.sendMessage());
        this.input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        this.closeButton.addEventListener('click', () => this.hide());
        this.consentButton.addEventListener('click', () => this.handleConsent());
        this.toggleButton.addEventListener('click', () => this.toggle());
        
        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.hide();
            }
        });
    };

    CivicChatWidget.prototype.loadInitialData = function() {
        var self = this;
        var configUrl = this.options.configUrl;
        
        // Load configuration
        if (configUrl) {
            loadConfig(configUrl).then(function(config) {
                self.options = Object.assign({}, self.options, config);
                self.checkConsent();
            }).catch(function() {
                self.checkConsent();
            });
        } else {
            this.checkConsent();
        }
    };

    CivicChatWidget.prototype.checkConsent = function() {
        var self = this;
        var consentEndpoint = this.options.consentEndpoint;
        
        checkConsent(consentEndpoint).then(function(hasConsent) {
            if (!hasConsent && consentEndpoint && consentEndpoint !== 'false') {
                self.showConsentPrompt();
            } else {
                self.ready = true;
                self.addMessage('bot', self.options.welcomeMessage || 'Hello! How can I help you today?');
            }
        });
    };

    CivicChatWidget.prototype.showConsentPrompt = function() {
        this.consentSection.style.display = 'block';
        this.input.disabled = true;
        this.sendButton.disabled = true;
    };

    CivicChatWidget.prototype.handleConsent = function() {
        var self = this;
        var consentEndpoint = this.options.consentEndpoint;
        
        if (!consentEndpoint) return;

        fetch(consentEndpoint, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function(res) {
            if (res.ok) {
                self.consentSection.style.display = 'none';
                self.input.disabled = false;
                self.sendButton.disabled = false;
                self.ready = true;
                self.addMessage('bot', 'Thank you! How can I help you today?');
            }
        }).catch(function(error) {
            console.error('[CivicChat] Consent submission failed:', error);
        });
    };

    CivicChatWidget.prototype.show = function() {
        if (!this.ready && this.consentSection.style.display !== 'block') {
            this.showConsentPrompt();
            return;
        }

        this.container.classList.remove('civic-chat--hidden');
        this.isOpen = true;
        this.toggleButton.innerHTML = '✕';
        this.toggleButton.setAttribute('aria-label', 'Close chat');
        setTimeout(() => this.input.focus(), 100);
    };

    CivicChatWidget.prototype.hide = function() {
        this.container.classList.add('civic-chat--hidden');
        this.isOpen = false;
        this.toggleButton.innerHTML = '💬';
        this.toggleButton.setAttribute('aria-label', 'Open chat');
    };

    CivicChatWidget.prototype.toggle = function() {
        if (this.isOpen) {
            this.hide();
        } else {
            this.show();
        }
    };

    CivicChatWidget.prototype.addMessage = function(sender, text) {
        var message = {
            id: generateId(),
            sender: sender,
            text: text,
            timestamp: new Date()
        };

        this.messages.push(message);
        this.renderMessage(message);
        this.scrollToBottom();
    };

    CivicChatWidget.prototype.renderMessage = function(message) {
        var messageEl = document.createElement('div');
        messageEl.className = 'civic-chat__message civic-chat__message--' + message.sender;
        messageEl.textContent = message.text;
        this.messagesContainer.appendChild(messageEl);
    };

    CivicChatWidget.prototype.showTypingIndicator = function() {
        var typingEl = document.createElement('div');
        typingEl.className = 'civic-chat__typing';
        typingEl.textContent = 'Typing...';
        typingEl.id = 'typing-indicator';
        this.messagesContainer.appendChild(typingEl);
        this.scrollToBottom();
    };

    CivicChatWidget.prototype.hideTypingIndicator = function() {
        var typingEl = qs('#typing-indicator', this.messagesContainer);
        if (typingEl) typingEl.remove();
    };

    CivicChatWidget.prototype.sendMessage = function() {
        var text = this.input.value.trim();
        if (!text || !this.ready) return;

        // Add user message
        this.addMessage('user', text);
        this.input.value = '';
        this.sendButton.disabled = true;

        // Show typing indicator
        this.showTypingIndicator();

        var self = this;
        
        // Simulate API call - replace with actual API
        setTimeout(function() {
            self.hideTypingIndicator();
            self.sendButton.disabled = false;
            self.addMessage('bot', 'I received: "' + text + '". This is a demo response from the widget.');
        }, 1000 + Math.random() * 1000);
    };

    CivicChatWidget.prototype.scrollToBottom = function() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    };

    CivicChatWidget.prototype.destroy = function() {
        if (this.container && this.container.parentNode) {
            this.container.parentNode.removeChild(this.container);
        }
        if (this.toggleButton && this.toggleButton.parentNode) {
            this.toggleButton.parentNode.removeChild(this.toggleButton);
        }
    };

    // Global initialization function
    async function init(options) {
        var el = options?.el || qs('#civic-chat');
        if (!el) {
            console.warn('[CivicChat] No element found for initialization');
            return null;
        }

        // Read configuration from data attributes
        var config = {
            apiUrl: options?.apiUrl || readData(el, 'apiUrl', '/chat'),
            consentEndpoint: options?.consentEndpoint || readData(el, 'consentEndpoint', '/accept'),
            configUrl: options?.configUrl || readData(el, 'configUrl', ''),
            title: options?.title || readData(el, 'title', 'Civic Chat'),
            welcomeMessage: options?.welcomeMessage || readData(el, 'welcomeMessage', 'Hello! How can I help you today?'),
            lang: options?.lang || readData(el, 'lang', 'en')
        };

        // Handle nonce for CSP
        var scriptEl = document.currentScript;
        var nonce = (scriptEl && scriptEl.getAttribute('nonce')) || options?.nonce;

        // Inject styles with nonce support if not using external CSS
        if (!options?.useExternalCSS) {
            // In production, CSS would be injected here
            // For now, we rely on external CSS file
            console.log('[CivicChat] Styles should be loaded via external CSS file for CSP compliance');
        }

        // Create and initialize widget
        var widget = new CivicChatWidget(config);
        
        // Auto-show if specified
        if (options?.autoShow !== false) {
            setTimeout(function() { 
                if (widget.ready) widget.show(); 
            }, 500);
        }

        return widget;
    }

    // Export to global scope
    window.CivicChat = { init: init, CivicChatWidget: CivicChatWidget };
})(window, document);