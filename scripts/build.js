// scripts/build.js

const fs = require('fs').promises;
const path = require('path');
const uglifyJS = require('uglify-js');
const cleanCSS = require('clean-css');
const htmlMinifier = require('html-minifier');

const CONFIG = {
    srcDir: path.join(__dirname, '../src'),
    distDir: path.join(__dirname, '../dist'),
    minifyOptions: {
        html: {
            removeComments: true,
            collapseWhitespace: true,
            minifyJS: true,
            minifyCSS: true
        },
        js: {
            compress: true,
            mangle: true
        }
    }
};

// Main build function
async function build() {
    try {
        console.log('🚀 Starting build process...');
        
        await cleanDist();
        
        await Promise.all([
            processJavaScript(),
            processCSSWithImports(),
            processHTML(),
            copyAssets()
        ]);

        console.log('✨ Build completed successfully!');
    } catch (error) {
        console.error('❌ Build failed:', error);
        process.exit(1);
    }
}

// Clean dist directory
async function cleanDist() {
    console.log('🧹 Cleaning dist directory...');
    try {
        await fs.rm(CONFIG.distDir, { recursive: true, force: true });
        await fs.mkdir(CONFIG.distDir, { recursive: true });
    } catch (error) {
        throw new Error(`Failed to clean dist directory: ${error.message}`);
    }
}

// Process JavaScript files
async function processJavaScript() {
    console.log('📦 Processing JavaScript files...');
    try {
        const files = await getAllFiles(path.join(CONFIG.srcDir, 'js'), '.js');
        
        for (const file of files) {
            const relativePath = path.relative(CONFIG.srcDir, file);
            const outputPath = path.join(CONFIG.distDir, relativePath);
            
            const code = await fs.readFile(file, 'utf8');
            const minified = uglifyJS.minify(code, CONFIG.minifyOptions.js);
            
            if (minified.error) {
                throw new Error(`Error minifying ${file}: ${minified.error}`);
            }

            await ensureDirectoryExistence(outputPath);
            await fs.writeFile(outputPath, minified.code);
            
            console.log(`   ✓ Processed: ${relativePath}`);
        }
    } catch (error) {
        throw new Error(`JavaScript processing failed: ${error.message}`);
    }
}

// New CSS processing function that handles imports
async function processCSSWithImports() {
    console.log('🎨 Processing CSS files...');
    try {
        const cssDir = path.join(CONFIG.srcDir, 'assets/css');
        
        // First, read and combine all CSS files
        const mainCssContent = await combineCSS(cssDir);
        
        // Minify the combined CSS
        const minified = new cleanCSS({
            level: 2,
            compatibility: '*'
        }).minify(mainCssContent);
        
        if (minified.errors.length > 0) {
            throw new Error(`CSS minification failed: ${minified.errors.join(', ')}`);
        }

        // Write the final CSS file
        const outputPath = path.join(CONFIG.distDir, 'assets/css/main.css');
        await ensureDirectoryExistence(outputPath);
        await fs.writeFile(outputPath, minified.styles);
        
        console.log('   ✓ Processed: assets/css/main.css');
    } catch (error) {
        throw new Error(`CSS processing failed: ${error.message}`);
    }
}

// Helper function to combine CSS files
async function combineCSS(baseDir) {
    const imports = {
        'utils/variables.css': '',
        'components/forms.css': '',
        'components/buttons.css': '',
        'components/cards.css': '',
        'components/transactions.css': '',
        'components/modal.css': ''
    };

    // Read all imported files
    for (const importPath of Object.keys(imports)) {
        const fullPath = path.join(baseDir, importPath);
        try {
            imports[importPath] = await fs.readFile(fullPath, 'utf8');
        } catch (error) {
            console.warn(`Warning: Could not read ${importPath}`);
        }
    }

    // Read main CSS file
    const mainCssPath = path.join(baseDir, 'main.css');
    let mainCss = await fs.readFile(mainCssPath, 'utf8');

    // Replace @import statements with actual content
    for (const [importPath, content] of Object.entries(imports)) {
        const importStatement = `@import '${importPath}';`;
        mainCss = mainCss.replace(importStatement, content);
    }

    return mainCss;
}

// Process HTML files
async function processHTML() {
    console.log('🔨 Processing HTML files...');
    try {
        const htmlFile = path.join(CONFIG.srcDir, 'index.html');
        const outputPath = path.join(CONFIG.distDir, 'index.html');
        
        let html = await fs.readFile(htmlFile, 'utf8');
        
        // Update CSS path in HTML
        html = html.replace(
            /<link rel="stylesheet" href="assets\/css\/main.css">/,
            '<link rel="stylesheet" href="assets/css/main.css">'
        );

        const minified = htmlMinifier.minify(html, CONFIG.minifyOptions.html);
        await fs.writeFile(outputPath, minified);
        
        console.log('   ✓ Processed: index.html');
    } catch (error) {
        throw new Error(`HTML processing failed: ${error.message}`);
    }
}

// Copy static assets
async function copyAssets() {
    console.log('📁 Copying static assets...');
    try {
        const assetsDirs = ['img', 'fonts'].map(dir => 
            path.join(CONFIG.srcDir, 'assets', dir)
        );

        for (const dir of assetsDirs) {
            if (await exists(dir)) {
                const relativePath = path.relative(CONFIG.srcDir, dir);
                const outputPath = path.join(CONFIG.distDir, relativePath);
                await copyDir(dir, outputPath);
                console.log(`   ✓ Copied: ${relativePath}`);
            }
        }
    } catch (error) {
        throw new Error(`Asset copying failed: ${error.message}`);
    }
}

// Utility functions
async function getAllFiles(dir, extension) {
    const files = [];
    
    async function traverse(currentDir) {
        const entries = await fs.readdir(currentDir, { withFileTypes: true });
        
        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);
            
            if (entry.isDirectory()) {
                await traverse(fullPath);
            } else if (entry.isFile() && path.extname(entry.name) === extension) {
                files.push(fullPath);
            }
        }
    }
    
    if (await exists(dir)) {
        await traverse(dir);
    }
    return files;
}

async function ensureDirectoryExistence(filePath) {
    const dirname = path.dirname(filePath);
    if (await exists(dirname)) {
        return true;
    }
    await fs.mkdir(dirname, { recursive: true });
}

async function exists(path) {
    try {
        await fs.access(path);
        return true;
    } catch {
        return false;
    }
}

async function copyDir(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            await copyDir(srcPath, destPath);
        } else {
            await fs.copyFile(srcPath, destPath);
        }
    }
}

// Run build
build();