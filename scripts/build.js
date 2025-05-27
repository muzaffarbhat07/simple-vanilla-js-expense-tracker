// scripts/build.js
import { promises as fs } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import uglifyJS from 'uglify-js';
import CleanCSS from 'clean-css';
import htmlMinifier from 'html-minifier';
import { globby } from 'globby';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CONFIG = {
    // Base directories
    src: path.join(__dirname, '../src'),
    dist: path.join(__dirname, '../dist'),

    patterns: {
        js: '**/*.js',
        css: '**/*.css',
        html: '**/*.html'
    },

    minify: {
        js: {
            compress: true,
            mangle: true
        },
        css: {
            level: 2,
            compatibility: '*'
        },
        html: {
            removeComments: true,
            collapseWhitespace: true,
            minifyJS: true,
            minifyCSS: true
        }
    },

    staticAssets: [
        '**/*.{jpg,jpeg,png,gif,svg,ico}',
        '**/*.{ttf,woff,woff2,eot}',
        '**/*.{json,xml}'
    ]
};

class Builder {
    #config;
    #processedFiles;

    constructor(config) {
        this.#config = config;
        this.#processedFiles = new Set();
    }

    async build() {
        try {
            console.log('🚀 Starting build process...');
            console.time('Build completed in');

            await this.#cleanDist();
            await this.#processAllFiles();

            console.timeEnd('Build completed in');
            console.log('✨ Build successful!');
        } catch (error) {
            console.error('❌ Build failed:', error);
            process.exit(1);
        }
    }

    async #cleanDist() {
        console.log('🧹 Cleaning dist directory...');
        await fs.rm(this.#config.dist, { recursive: true, force: true });
        await fs.mkdir(this.#config.dist, { recursive: true });
    }

    async #processAllFiles() {
        const tasks = [];

        for (const [type, pattern] of Object.entries(this.#config.patterns)) {
            const files = await this.#findFiles(pattern);
            for (const file of files) {
                tasks.push(this.#processFile(file, type));
            }
        }

        const staticFiles = await this.#findFiles(this.#config.staticAssets);
        for (const file of staticFiles) {
            if (!this.#processedFiles.has(file)) {
                tasks.push(this.#copyFile(file));
            }
        }

        await Promise.all(tasks);
    }

    async #findFiles(patterns) {
        const files = await globby(
            Array.isArray(patterns) ? patterns : [patterns],
            {
                cwd: this.#config.src,
                absolute: true
            }
        );
        return files;
    }

    async #processFile(filepath, type) {
        try {
            this.#processedFiles.add(filepath);
            const relativePath = path.relative(this.#config.src, filepath);
            const outputPath = path.join(this.#config.dist, relativePath);

            console.log(`Processing ${type}: ${relativePath}`);

            let content = await fs.readFile(filepath, 'utf8');
            let processed;

            switch (type) {
                case 'js':
                    processed = await this.#processJS(content, filepath);
                    break;
                case 'css':
                    processed = await this.#processCSS(content, filepath);
                    break;
                case 'html':
                    processed = await this.#processHTML(content, filepath);
                    break;
                default:
                    processed = content;
            }

            await this.#writeFile(outputPath, processed);
            console.log(`✓ Processed: ${relativePath}`);
        } catch (error) {
            console.error(`Error processing ${filepath}:`, error);
            throw error;
        }
    }

    async #processJS(content, filepath) {
        const result = uglifyJS.minify(content, this.#config.minify.js);
        if (result.error) {
            throw new Error(`JS minification failed for ${filepath}: ${result.error}`);
        }
        return result.code;
    }

    async #processCSS(content, filepath) {
        content = await this.#resolveImports(content, filepath);
        
        const result = new CleanCSS(this.#config.minify.css).minify(content);
        if (result.errors.length) {
            throw new Error(`CSS minification failed for ${filepath}: ${result.errors.join(', ')}`);
        }
        return result.styles;
    }

    async #processHTML(content, filepath) {
        return htmlMinifier.minify(content, this.#config.minify.html);
    }

    async #resolveImports(content, filepath) {
        const importRegex = /@import\s+['"]([^'"]+)['"]\s*;/g;
        const dir = path.dirname(filepath);
        
        const resolveImport = async (match, importPath) => {
            const absolutePath = path.join(dir, importPath);
            try {
                const importedContent = await fs.readFile(absolutePath, 'utf8');
                return await this.#resolveImports(importedContent, absolutePath);
            } catch (error) {
                console.warn(`Warning: Could not resolve import ${importPath} in ${filepath}`);
                return '';
            }
        };

        let result = content;
        let match;
        while ((match = importRegex.exec(content)) !== null) {
            const [fullMatch, importPath] = match;
            const resolved = await resolveImport(fullMatch, importPath);
            result = result.replace(fullMatch, resolved);
        }

        return result;
    }

    async #copyFile(filepath) {
        const relativePath = path.relative(this.#config.src, filepath);
        const outputPath = path.join(this.#config.dist, relativePath);
        
        await this.#writeFile(outputPath, await fs.readFile(filepath));
        console.log(`✓ Copied: ${relativePath}`);
    }

    async #writeFile(filepath, content) {
        await fs.mkdir(path.dirname(filepath), { recursive: true });
        await fs.writeFile(filepath, content);
    }
}

class BuilderWithPlugins extends Builder {
    #plugins;

    constructor(config) {
        super(config);
        this.#plugins = [];
    }

    use(plugin) {
        this.#plugins.push(plugin);
        return this;
    }

    async processFile(filepath, type) {
        let content = await fs.readFile(filepath, 'utf8');

        for (const plugin of this.#plugins) {
            if (plugin.supports?.(type)) {
                content = await plugin.process(content, filepath, type);
            }
        }

        return super.processFile(filepath, type);
    }
}

// Plugin interface
class Plugin {
    supports(type) {
        throw new Error('Plugin must implement supports method');
    }

    async process(content, filepath, type) {
        throw new Error('Plugin must implement process method');
    }
}

// Example plugins
class AutoprefixerPlugin extends Plugin {
    supports(type) {
        return type === 'css';
    }

    async process(content) {
        // Add autoprefixer logic here
        return content;
    }
}

class ImageOptimizerPlugin extends Plugin {
    supports(type) {
        return type === 'image';
    }

    async process(content) {
        // Add image optimization logic here
        return content;
    }
}

// Export builder and plugins
export { 
  Builder, 
  BuilderWithPlugins, 
  Plugin, 
  AutoprefixerPlugin, 
  ImageOptimizerPlugin 
};

// Run build if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
    const builder = new BuilderWithPlugins(CONFIG);
    builder.build();
}