# Civic Chat Widget

A standalone, CDN-ready chat widget with zero dependencies.

## 🚀 Quick Start

### Basic Integration

```html
<!-- Mount point -->
<div id="civic-chat" 
     data-api-url="/api/chat" 
     data-consent-endpoint="/api/consent"
     data-title="Support Chat">
</div>

<!-- Styles -->
<link rel="stylesheet" 
      href="https://cdn.jsdelivr.net/gh/johanna1105/civic-chat-widget@1.0.0/dist/widget.min.css"
      integrity="sha384-OLBgp1GsljhM2TJ+sbHjaiH9txEUvgdDTAzHv2P24donTt6/529l+9Ua0vFImLlb"
      crossorigin="anonymous">

<!-- Script -->
<script 
    src="https://cdn.jsdelivr.net/gh/johanna1105/civic-chat-widget@1.0.0/dist/widget.min.js"
    integrity="sha384-g6lH99Zo06jIhG846kMVw7xWoMQXHrBGW1OpjxeLlsR3aDM+KemouwWGq7ZkN6u+"
    crossorigin="anonymous" 
    async></script>

<!-- Initialization -->
<script>
    window.CivicChat && window.CivicChat.init();
</script>
```

## 📦 CDN URLs

- **Latest**: `https://cdn.jsdelivr.net/gh/johanna1105/civic-chat-widget@main/dist/widget.min.js`
- **Versioned**: `https://cdn.jsdelivr.net/gh/johanna1105/civic-chat-widget@1.0.0/dist/widget.min.js`
- **CSS**: `https://cdn.jsdelivr.net/gh/johanna1105/civic-chat-widget@1.0.0/dist/widget.min.css`

## ⚙️ Configuration

### Data Attributes
- `data-api-url` - API endpoint for chat messages
- `data-consent-endpoint` - Consent management endpoint
- `data-config-url` - URL to load configuration from
- `data-title` - Widget title
- `data-welcome-message` - Initial welcome message

### JavaScript API
```javascript
window.CivicChat.init({
    el: document.getElementById('civic-chat'),
    apiUrl: '/api/chat',
    consentEndpoint: '/api/consent',
    configUrl: '/api/config.json',
    title: 'Support Chat',
    welcomeMessage: 'Hello! How can I help you?',
    useExternalCSS: true // for CSP compliance
});
```

## 🔒 Security Features

- **SRI**: All resources include integrity hashes
- **CSP Compatible**: No inline styles, nonce support
- **CORS**: Proper cross-origin headers
- **Immutable Caching**: Versioned files cache for 1 year

## 🛠️ Development

```bash
npm install
npm run build
```

## 📄 License

MIT
