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
        console.log('🔨 Building JavaScript...');
        
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

        // Read and verify the built file
        const jsContent = fs.readFileSync('dist/widget.min.js', 'utf8');
        if (jsContent.length === 0) {
            throw new Error('JavaScript build produced empty file');
        }

        console.log('✅ JavaScript built successfully - Size:', jsContent.length, 'bytes');

        // Generate hash
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
        console.log('🎨 Building CSS...');
        
        if (minifiedCSS.length === 0) {
            throw new Error('CSS content is empty');
        }

        // Write minified CSS
        fs.writeFileSync('dist/widget.min.css', minifiedCSS);
        
        // Verify file was written
        const writtenCSS = fs.readFileSync('dist/widget.min.css', 'utf8');
        if (writtenCSS.length === 0) {
            throw new Error('CSS file is empty after writing');
        }
        
        // Generate hash for CSS
        const cssHash = crypto.createHash('sha384').update(minifiedCSS).digest('base64');
        
        // Create versioned CSS file
        const versionedCSSFilename = `widget.${cssHash.substring(0, 16)}.min.css`;
        fs.writeFileSync(path.join('dist', versionedCSSFilename), minifiedCSS);

        console.log('✅ CSS built successfully - Size:', writtenCSS.length, 'bytes');
        console.log('✅ Versioned CSS file created:', versionedCSSFilename);

        return { cssHash, versionedCSSFilename };
    } catch (error) {
        console.error('❌ CSS build failed:', error);
        process.exit(1);
    }
}

// Generate example files
function generateExamples(jsHash, cssHash) {
    const examplesDir = 'examples';
    if (!fs.existsSync(examplesDir)) {
        fs.mkdirSync(examplesDir);
    }

    // Basic example
    const basicExample = `<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Civic Chat Widget Test</title>
    <link rel="stylesheet" href="../dist/widget.min.css">
    <style>
        body {
            font-family: system-ui, sans-serif;
            padding: 20px;
            max-width: 800px;
            margin: 0 auto;
            background: #f8fafc;
        }
        .info {
            background: white;
            padding: 20px;
            border-radius: 12px;
            margin: 20px 0;
            border-left: 4px solid #2563eb;
        }
    </style>
</head>
<body>
    <h1>🧪 Civic Chat Widget Test</h1>
    
    <div class="info">
        <h3>Widget sollte erscheinen:</h3>
        <p>Unten rechts sollte ein blauer Chat-Button erscheinen: 💬</p>
    </div>

    <!-- Widget Mount Point -->
    <div id="civic-chat" 
         data-api-url="/api/chat"
         data-title="Test Widget"
         data-welcome-message="Hallo! Das Widget funktioniert!">
    </div>

    <!-- Widget Script -->
    <script src="../dist/widget.min.js"></script>
    <script>
        window.CivicChat && window.CivicChat.init();
    </script>
</body>
</html>`;

    fs.writeFileSync(path.join(examplesDir, 'basic.html'), basicExample);
    console.log('✅ Example files generated');
}

// Main build function
async function main() {
    console.log('🚀 Starting build process...\n');

    try {
        const { jsHash, versionedFilename } = await buildJS();
        const { cssHash, versionedCSSFilename } = buildCSS();
        
        generateExamples(jsHash, cssHash);

        console.log('\n🎉 Build completed successfully!');
        console.log('\n📋 Generated files in dist/:');
        console.log('   📄 widget.min.js');
        console.log('   🎨 widget.min.css');
        console.log('   📄 ' + versionedFilename);
        console.log('   🎨 ' + versionedCSSFilename);
        
    } catch (error) {
        console.error('\n💥 Build failed:', error);
        process.exit(1);
    }
}

// Run build
main().catch(console.error);