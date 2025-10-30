const fs = require('fs');
const crypto = require('crypto');

function generateSRI() {
    console.log('Generating SRI hashes...\n');
    
    try {
        // Read the built files
        const cssContent = fs.readFileSync('dist/widget.min.css', 'utf8');
        const jsContent = fs.readFileSync('dist/widget.min.js', 'utf8');
        
        // Generate SHA384 hashes
        const cssHash = crypto.createHash('sha384').update(cssContent).digest('base64');
        const jsHash = crypto.createHash('sha384').update(jsContent).digest('base64');
        
        console.log('SRI Hashes generated:\n');
        console.log('CSS Integrity:');
        console.log(`integrity="sha384-${cssHash}"`);
        console.log('\nJS Integrity:');
        console.log(`integrity="sha384-${jsHash}"`);
        
        const htmlSnippet = `<!-- Civic Chat Widget with SRI -->
<link rel="stylesheet" 
      href="https://cdn.jsdelivr.net/gh/johanna1105/civic-chat-widget@v2.0.0/dist/widget.min.css"
      integrity="sha384-${cssHash}"
      crossorigin="anonymous">

<script src="https://cdn.jsdelivr.net/gh/johanna1105/civic-chat-widget@v2.0.0/dist/widget.min.js"
        integrity="sha384-${jsHash}"
        crossorigin="anonymous"></script>

<!-- Widget Container -->
<div id="civic-chat" 
     data-title="Support Chat"
     data-welcome-message="Hello! How can I help you?"></div>

<!-- Initialization -->
<script>
    window.CivicChat && window.CivicChat.init();
</script>`;
        
        console.log('\n Complete HTML snippet:\n');
        console.log(htmlSnippet);
        
        fs.writeFileSync('sri-snippet.html', htmlSnippet);
        console.log('\n Saved to: sri-snippet.html');
        
    } catch (error) {
        console.error('Error generating SRI:', error);
    }
}

generateSRI();