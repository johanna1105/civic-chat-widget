const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Ensure dist directory exists
if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

// Read source files
const jsContent = fs.readFileSync('src/widget.js', 'utf8');
const cssContent = fs.readFileSync('src/widget.css', 'utf8');

// Safe CSS minification (only remove comments and whitespace)
function minifyCSS(css) {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove comments
        .replace(/\s+/g, ' ')             // Collapse whitespace
        .replace(/;\s*/g, ';')           // Remove spaces after semicolons
        .replace(/:\s+/g, ':')           // Remove spaces after colons
        .replace(/\s*\{\s*/g, '{')       // Remove spaces around braces
        .replace(/\s*\}\s*/g, '}')
        .replace(/\s*\,\s*/g, ',')
        .trim();
}

// Safe JS minification (preserve template literals)
function minifyJS(js) {
    // First, protect template literals
    const templateLiterals = [];
    let templateIndex = 0;
    
    // Replace template literals with placeholders
    const protectedJS = js.replace(/`[\s\S]*?`/g, (match) => {
        const placeholder = `__TEMPLATE_${templateIndex}__`;
        templateLiterals[templateIndex] = match;
        templateIndex++;
        return placeholder;
    });
    
    // Minify the protected code
    let minified = protectedJS
        .replace(/\/\/.*$/gm, '')        // Remove single line comments
        .replace(/\/\*[\s\S]*?\*\//g, '') // Remove multi-line comments
        .replace(/\s+/g, ' ')            // Collapse whitespace
        .replace(/\s*([=+\-*\/%&|^~<>!(){}\[\];:,])\s*/g, '$1') // Remove spaces around operators
        .trim();
    
    // Restore template literals
    templateLiterals.forEach((template, index) => {
        const placeholder = `__TEMPLATE_${index}__`;
        minified = minified.replace(placeholder, template);
    });
    
    return minified;
}

// Build process
function build() {
    console.log('🚀 Starting build process...\n');
    
    try {
        // Minify CSS
        console.log('🎨 Minifying CSS...');
        const minifiedCSS = minifyCSS(cssContent);
        fs.writeFileSync('dist/widget.min.css', minifiedCSS);
        
        const originalCSSSize = Buffer.byteLength(cssContent, 'utf8');
        const minifiedCSSSize = Buffer.byteLength(minifiedCSS, 'utf8');
        const cssSavings = ((originalCSSSize - minifiedCSSSize) / originalCSSSize * 100).toFixed(1);
        
        console.log(`✅ CSS: ${originalCSSSize} → ${minifiedCSSSize} bytes (${cssSavings}% reduction)`);
        
        // Minify JS
        console.log('🔨 Minifying JavaScript...');
        const minifiedJS = minifyJS(jsContent);
        fs.writeFileSync('dist/widget.min.js', minifiedJS);
        
        const originalJSSize = Buffer.byteLength(jsContent, 'utf8');
        const minifiedJSSize = Buffer.byteLength(minifiedJS, 'utf8');
        const jsSavings = ((originalJSSize - minifiedJSSize) / originalJSSize * 100).toFixed(1);
        
        console.log(`✅ JavaScript: ${originalJSSize} → ${minifiedJSSize} bytes (${jsSavings}% reduction)`);
        
        // Verify the minified JS is valid
        console.log('🔍 Validating JavaScript...');
        try {
            // Quick syntax check by parsing
            new Function(minifiedJS);
            console.log('✅ JavaScript syntax is valid');
        } catch (e) {
            console.log('❌ JavaScript syntax error:', e.message);
            // Fallback: use original JS
            console.log('🔄 Using original JavaScript as fallback');
            fs.writeFileSync('dist/widget.min.js', jsContent);
        }
        
        // Generate SRI hashes
        console.log('🔒 Generating SRI hashes...');
        const finalJS = fs.readFileSync('dist/widget.min.js', 'utf8');
        const finalCSS = fs.readFileSync('dist/widget.min.css', 'utf8');
        
        const cssHash = crypto.createHash('sha384').update(finalCSS).digest('base64');
        const jsHash = crypto.createHash('sha384').update(finalJS).digest('base64');
        
        console.log(`✅ CSS SRI: sha384-${cssHash.substring(0, 20)}...`);
        console.log(`✅ JS SRI: sha384-${jsHash.substring(0, 20)}...`);
        
        console.log('\n🎉 Build completed successfully!');
        console.log('\n📁 Generated files:');
        console.log(`   📄 widget.min.js (${minifiedJSSize} bytes)`);
        console.log(`   🎨 widget.min.css (${minifiedCSSSize} bytes)`);
        
    } catch (error) {
        console.error('❌ Build failed:', error);
        process.exit(1);
    }
}

// Run build
build();