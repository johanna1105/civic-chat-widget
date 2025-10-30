const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist');
}

const jsContent = fs.readFileSync('src/widget.js', 'utf8');
const cssContent = fs.readFileSync('src/widget.css', 'utf8');

// Safe CSS minification (only remove comments and whitespace)
function minifyCSS(css) {
    return css
        .replace(/\/\*[\s\S]*?\*\//g, '') 
        .replace(/\s+/g, ' ')             
        .replace(/;\s*/g, ';')           
        .replace(/:\s+/g, ':')          
        .replace(/\s*\{\s*/g, '{')       
        .replace(/\s*\}\s*/g, '}')
        .replace(/\s*\,\s*/g, ',')
        .trim();
}

// Safe JS minification (preserve template literals)
function minifyJS(js) {
    const templateLiterals = [];
    let templateIndex = 0;
    
    const protectedJS = js.replace(/`[\s\S]*?`/g, (match) => {
        const placeholder = `__TEMPLATE_${templateIndex}__`;
        templateLiterals[templateIndex] = match;
        templateIndex++;
        return placeholder;
    });
    
    // Minify the protected code
    let minified = protectedJS
        .replace(/\/\/.*$/gm, '')        
        .replace(/\/\*[\s\S]*?\*\//g, '') 
        .replace(/\s+/g, ' ')           
        .replace(/\s*([=+\-*\/%&|^~<>!(){}\[\];:,])\s*/g, '$1') 
        .trim();
    
    
    templateLiterals.forEach((template, index) => {
        const placeholder = `__TEMPLATE_${index}__`;
        minified = minified.replace(placeholder, template);
    });
    
    return minified;
}


function build() {
    console.log(' Starting build process...\n');
    
    try {
        
        console.log(' Minifying CSS...');
        const minifiedCSS = minifyCSS(cssContent);
        fs.writeFileSync('dist/widget.min.css', minifiedCSS);
        
        const originalCSSSize = Buffer.byteLength(cssContent, 'utf8');
        const minifiedCSSSize = Buffer.byteLength(minifiedCSS, 'utf8');
        const cssSavings = ((originalCSSSize - minifiedCSSSize) / originalCSSSize * 100).toFixed(1);
        
        console.log(` CSS: ${originalCSSSize} → ${minifiedCSSSize} bytes (${cssSavings}% reduction)`);
        
        
        console.log(' Minifying JavaScript...');
        const minifiedJS = minifyJS(jsContent);
        fs.writeFileSync('dist/widget.min.js', minifiedJS);
        
        const originalJSSize = Buffer.byteLength(jsContent, 'utf8');
        const minifiedJSSize = Buffer.byteLength(minifiedJS, 'utf8');
        const jsSavings = ((originalJSSize - minifiedJSSize) / originalJSSize * 100).toFixed(1);
        
        console.log(` JavaScript: ${originalJSSize} → ${minifiedJSSize} bytes (${jsSavings}% reduction)`);
        
        
        console.log(' Validating JavaScript...');
        try {
            new Function(minifiedJS);
            console.log(' JavaScript syntax is valid');
        } catch (e) {
            console.log(' JavaScript syntax error:', e.message);
            console.log(' Using original JavaScript as fallback');
            fs.writeFileSync('dist/widget.min.js', jsContent);
        }
        
        console.log('\n Build completed successfully!');
        console.log('\n Generated files:');
        console.log(`    widget.min.js (${minifiedJSSize} bytes)`);
        console.log(`    widget.min.css (${minifiedCSSSize} bytes)`);
        
    } catch (error) {
        console.error('Build failed:', error);
        process.exit(1);
    }
}

build();