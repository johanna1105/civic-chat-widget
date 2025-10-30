# Civic Chat Widget

CDN-chat widget.

## Quick Start

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
      href="https://cdn.jsdelivr.net/gh/johanna1105/civic-chat-widget@main/dist/widget.min.css"
      integrity="sha384-esQLXx6+tYzpomr0enQUlEgejEWcQBu/KiguLZo5VSlGzjweHs3HpVeisnAlfFEt"
      crossorigin="anonymous">

<!-- Script -->
<script 
    src="https://cdn.jsdelivr.net/gh/johanna1105/civic-chat-widget@main/dist/widget.min.js"
    integrity="sha384-zMpLxbF0YwbAPIrg4SYhYAyrY0pgd1u3aMR6KMpSB6a6MEQSgBVvD3rF99BR/ZjN"
    crossorigin="anonymous" 
    async></script>

<!-- Initialization -->
<script>
    window.CivicChat && window.CivicChat.init();
</script>
```

## CDN URLs

- **Latest**: `https://cdn.jsdelivr.net/gh/johanna1105/civic-chat-widget@main/dist/widget.min.js`

- **CSS**: `https://cdn.jsdelivr.net/gh/johanna1105/civic-chat-widget@main/dist/widget.min.css`

## Configuration

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
    useExternalCSS: true 
});
```

## Security Features

- **SRI**: All resources include integrity hashes
- **CSP Compatible**: No inline styles, nonce support
- **CORS**: Proper cross-origin headers
- **Immutable Caching**: Versioned files cache for 1 year

## Development

```bash
npm install
npm run build
```

