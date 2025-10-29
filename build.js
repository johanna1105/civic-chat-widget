const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Ensure dist directory exists
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

// Read CSS file
const cssContent = fs.readFileSync('src/widget.css', 'utf8');

// Minify CSS (simple minification)
function minifyCSS(css) {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
        .replace(/\s+/g, ' ') // Collapse whitespace
        .replace(/;\s*/g, ';') // Remove spaces after semicolons
        .replace(/:\s+/g, ':') // Remove spaces after colons
        .replace(/\s*\{\s*/g, '{') // Clean around braces
        .replace(/\s*\}\s*/g, '}')
        .replace(/\s*\,\s*/g, ',')
        .replace(/\s*\>\s*/g, '>')
        .trim();
}

const minifiedCSS = minifyCSS(cssContent);

// Build JavaScript with esbuild
async function buildJS() {
    try {
        // Build main widget file
        await esbuild.build({
            entryPoints: ['src/widget.js'],
            bundle: true,
            minify: true,
            outfile: 'dist/widget.min.js',
            format: 'iife',
            globalName: 'CivicChat',
            target: ['es2015'],
            legalComments: 'none'
        });

        console.log('✅ JavaScript built successfully');

        // Read the built file and generate hash
        const jsContent = fs.readFileSync('dist/widget.min.js');
        const jsHash = crypto.createHash('sha384').update(jsContent).digest('base64');

        // Create versioned file
        const versionedFilename = `widget.${jsHash.substring(0, 16)}.min.js`;
        fs.writeFileSync(path.join('dist', versionedFilename), jsContent);

        console.log('✅ Versioned JavaScript file created:', versionedFilename);

        return { jsHash, versionedFilename };
    } catch (error) {
        console.error('❌ JavaScript build failed:', error);
        process.exit(1);
    }
}

// Build CSS
function buildCSS() {
    try {
        // Write minified CSS
        fs.writeFileSync('dist/widget.min.css', minifiedCSS);
        
        // Generate hash for CSS
        const cssHash = crypto.createHash('sha384').update(minifiedCSS).digest('base64');
        
        // Create versioned CSS file
        const versionedCSSFilename = `widget.${cssHash.substring(0, 16)}.min.css`;
        fs.writeFileSync(path.join('dist', versionedCSSFilename), minifiedCSS);

        console.log('✅ CSS built successfully');
        console.log('✅ Versioned CSS file created:', versionedCSSFilename);

        return { cssHash, versionedCSSFilename };
    } catch (error) {
        console.error('❌ CSS build failed:', error);
        process.exit(1);
    }
}

// Generate example files with actual hashes
function generateExamples(jsHash, cssHash) {
    const examplesDir = 'examples';
    if (!fs.existsSync(examplesDir)) {
        fs.mkdirSync(examplesDir);
    }

    // Basic example
    const basicExample = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Civic Chat Widget - Basic Example</title>
    <link rel="stylesheet" href="../dist/widget.min.css">
    <style>
        body {
            font-family: system-ui, sans-serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
            line-height: 1.6;
        }
        .instructions {
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #2563eb;
        }
        code {
            background: #f1f5f9;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', monospace;
            font-size: 0.9em;
        }
        pre {
            background: #1e293b;
            color: #e2e8f0;
            padding: 16px;
            border-radius: 8px;
            overflow-x: auto;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <h1>Civic Chat Widget - Basic Example</h1>
    
    <div class="instructions">
        <h3>🚀 Integration Code:</h3>
        <pre><code>&lt;!-- Mount point with configuration --&gt;
&lt;div id="civic-chat" 
     data-api-url="/api/chat" 
     data-consent-endpoint="/api/consent"
     data-title="Support Chat"
     data-welcome-message="Hello! How can we help you?"&gt;
&lt;/div&gt;

&lt;!-- Widget CSS --&gt;
&lt;link rel="stylesheet" 
      href="https://cdn.jsdelivr.net/gh/johanna1105/civic-chat-widget@1.0.0/dist/widget.min.css"
      integrity="sha384-${cssHash}"
      crossorigin="anonymous"&gt;

&lt;!-- Widget JS with SRI --&gt;
&lt;script 
    src="https://cdn.jsdelivr.net/gh/johanna1105/civic-chat-widget@1.0.0/dist/widget.min.js"
    integrity="sha384-${jsHash}"
    crossorigin="anonymous" 
    async&gt;&lt;/script&gt;

&lt;!-- Initialization --&gt;
&lt;script&gt;
    window.CivicChat && window.CivicChat.init();
&lt;/script&gt;</code></pre>
    </div>

    <h2>📖 How it works:</h2>
    <ul>
        <li>Widget loads asynchronously without blocking page render</li>
        <li>Configuration via <code>data-*</code> attributes</li>
        <li>SRI hashes ensure integrity</li>
        <li>CSS and JS are cached immutable for 1 year</li>
        <li>No external dependencies - pure vanilla JS</li>
    </ul>

    <!-- Widget Mount Point -->
    <div id="civic-chat" 
         data-api-url="/api/chat" 
         data-consent-endpoint="/api/consent"
         data-title="Support Chat"
         data-welcome-message="Hello! How can we help you today?">
    </div>

    <!-- Widget Implementation -->
    <link rel="stylesheet" 
          href="../dist/widget.min.css"
          integrity="sha384-${cssHash}"
          crossorigin="anonymous">

    <script 
        src="../dist/widget.min.js" 
        integrity="sha384-${jsHash}"
        crossorigin="anonymous" 
        async></script>
    <script>
        window.CivicChat && window.CivicChat.init();
    </script>
</body>
</html>`;

    // CSP Strict example
    const cspStrictExample = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="Content-Security-Policy" content="
        default-src 'self';
        script-src 'self' https://cdn.jsdelivr.net 'sha384-${jsHash}';
        style-src 'self' https://cdn.jsdelivr.net 'sha384-${cssHash}';
        connect-src 'self';
        font-src 'self';
        object-src 'none';
        base-uri 'self';
        form-action 'self';
        frame-ancestors 'none';
    ">
    <title>Civic Chat Widget - CSP Strict Example</title>
    <link rel="stylesheet" 
          href="../dist/widget.min.css"
          integrity="sha384-${cssHash}"
          crossorigin="anonymous">
    <style>
        body {
            font-family: system-ui, sans-serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
        }
        .csp-info {
            background: #f0f9ff;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #0369a1;
        }
    </style>
</head>
<body>
    <h1>Civic Chat Widget - CSP Strict Example</h1>
    
    <div class="csp-info">
        <h3>🔒 Strict CSP Headers Active</h3>
        <p>This example uses separate CSS file and SRI for both JS and CSS. No 'unsafe-inline' required!</p>
        <p><strong>CSP Directive:</strong> <code>style-src 'self' https://cdn.jsdelivr.net 'sha384-${cssHash}'</code></p>
    </div>

    <!-- Widget Mount Point -->
    <div id="civic-chat" 
         data-api-url="/api/chat" 
         data-config-url="/api/config.json">
    </div>

    <!-- Widget Script with SRI -->
    <script 
        src="../dist/widget.min.js"
        integrity="sha384-${jsHash}"
        crossorigin="anonymous" 
        async></script>
    <script>
        window.CivicChat && window.CivicChat.init({
            useExternalCSS: true // Important for CSP compliance
        });
    </script>
</body>
</html>`;

    // Config example
    const configExample = {
        "apiUrl": "/api/chat",
        "consentEndpoint": "/api/consent",
        "title": "Support Chat",
        "welcomeMessage": "Hello! How can I help you today?",
        "lang": "en",
        "features": {
            "typingIndicator": true,
            "autoFocus": true,
            "escapeToClose": true
        }
    };

    fs.writeFileSync(path.join(examplesDir, 'basic.html'), basicExample);
    fs.writeFileSync(path.join(examplesDir, 'csp-strict.html'), cspStrictExample);
    fs.writeFileSync(path.join(examplesDir, 'config.json'), JSON.stringify(configExample, null, 2));

    console.log('✅ Example files generated');
}

// Generate README with instructions
function generateReadme(jsHash, cssHash) {
    const readmeContent = `# Civic Chat Widget

A standalone, CDN-ready chat widget with zero dependencies.

## 🚀 Quick Start

### Basic Integration

\`\`\`html
<!-- Mount point -->
<div id="civic-chat" 
     data-api-url="/api/chat" 
     data-consent-endpoint="/api/consent"
     data-title="Support Chat">
</div>

<!-- Styles -->
<link rel="stylesheet" 
      href="https://cdn.jsdelivr.net/gh/johanna1105/civic-chat-widget@1.0.0/dist/widget.min.css"
      integrity="sha384-${cssHash}"
      crossorigin="anonymous">

<!-- Script -->
<script 
    src="https://cdn.jsdelivr.net/gh/johanna1105/civic-chat-widget@1.0.0/dist/widget.min.js"
    integrity="sha384-${jsHash}"
    crossorigin="anonymous" 
    async></script>

<!-- Initialization -->
<script>
    window.CivicChat && window.CivicChat.init();
</script>
\`\`\`

## 📦 CDN URLs

- **Latest**: \`https://cdn.jsdelivr.net/gh/johanna1105/civic-chat-widget@main/dist/widget.min.js\`
- **Versioned**: \`https://cdn.jsdelivr.net/gh/johanna1105/civic-chat-widget@1.0.0/dist/widget.min.js\`
- **CSS**: \`https://cdn.jsdelivr.net/gh/johanna1105/civic-chat-widget@1.0.0/dist/widget.min.css\`

## ⚙️ Configuration

### Data Attributes
- \`data-api-url\` - API endpoint for chat messages
- \`data-consent-endpoint\` - Consent management endpoint
- \`data-config-url\` - URL to load configuration from
- \`data-title\` - Widget title
- \`data-welcome-message\` - Initial welcome message

### JavaScript API
\`\`\`javascript
window.CivicChat.init({
    el: document.getElementById('civic-chat'),
    apiUrl: '/api/chat',
    consentEndpoint: '/api/consent',
    configUrl: '/api/config.json',
    title: 'Support Chat',
    welcomeMessage: 'Hello! How can I help you?',
    useExternalCSS: true // for CSP compliance
});
\`\`\`

## 🔒 Security Features

- **SRI**: All resources include integrity hashes
- **CSP Compatible**: No inline styles, nonce support
- **CORS**: Proper cross-origin headers
- **Immutable Caching**: Versioned files cache for 1 year

## 🛠️ Development

\`\`\`bash
npm install
npm run build
\`\`\`

## 📄 License

MIT
`;

    fs.writeFileSync('README.md', readmeContent);
    console.log('✅ README.md generated');
}

// Main build function
async function main() {
    console.log('🚀 Starting build process...\\n');

    const { jsHash, versionedFilename } = await buildJS();
    const { cssHash, versionedCSSFilename } = buildCSS();
    
    generateExamples(jsHash, cssHash);
    generateReadme(jsHash, cssHash);

    console.log('\\n🎉 Build completed!');
    console.log('\\n📋 Next steps:');
    console.log('1. Create GitHub repository');
    console.log('2. Push code: git push origin main');
    console.log('3. Test CDN URLs:');
    console.log('   JS:  https://cdn.jsdelivr.net/gh/johanna1105/civic-chat-widget@main/dist/widget.min.js');
    console.log('   CSS: https://cdn.jsdelivr.net/gh/johanna1105/civic-chat-widget@main/dist/widget.min.css');
    console.log('4. Update package.json version for releases');
    console.log('5. Test SRI hashes in examples');
}

// Run build
main().catch(console.error);