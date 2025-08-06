// frontend/vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

export default defineConfig({
  plugins: [react()],
  
  server: {
    proxy: {
      // Proxy all API requests to Go backend
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
      },
      // Direct endpoints (for backward compatibility)
      '/items': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
      },
      '/login': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
      },
      '/register': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
      },
      '/bookings': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
      },
      '/profile': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
        secure: false,
      },
    },
    // Ensure proper MIME types for dev server
    mimeTypes: {
      'js': 'application/javascript',
      'jsx': 'application/javascript', 
      'mjs': 'application/javascript',
      'ts': 'application/javascript',
      'tsx': 'application/javascript'
    }
  },
  
  build: {
    // Enhanced build configuration for performance
    target: 'es2020', // Better browser support while maintaining performance
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        // Enhanced chunking strategy for smaller bundles
        manualChunks: (id) => {
          // Core React libraries
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          // Router
          if (id.includes('node_modules/react-router-dom/')) {
            return 'vendor-router';
          }
          // Material UI core
          if (id.includes('node_modules/@mui/material/') || 
              id.includes('node_modules/@emotion/')) {
            return 'vendor-mui-core';
          }
          // Material UI icons (separate chunk)
          if (id.includes('node_modules/@mui/icons-material/')) {
            return 'vendor-mui-icons';
          }
          // Date picker (lazy loaded)
          if (id.includes('node_modules/@mui/x-date-pickers/')) {
            return 'vendor-date-picker';
          }
          // HTTP client
          if (id.includes('node_modules/axios/')) {
            return 'vendor-http';
          }
          // Date utilities
          if (id.includes('node_modules/dayjs/')) {
            return 'vendor-utils';
          }
          // Payment libraries (separate chunks for lazy loading)
          if (id.includes('node_modules/@stripe/')) {
            return 'vendor-stripe';
          }
          if (id.includes('node_modules/razorpay/')) {
            return 'vendor-razorpay';
          }
          // Other node_modules
          if (id.includes('node_modules/')) {
            return 'vendor-misc';
          }
        },
        // Optimize chunk file names with better caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop().replace(/\.(jsx?|tsx?)$/, '')
            : 'chunk';
          return `assets/js/${facadeModuleId}-[hash:8].js`;
        },
        // Optimize asset file names  
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'assets/css/[name]-[hash:8].css';
          }
          if (/\.(png|jpe?g|gif|svg|ico)$/i.test(assetInfo.name)) {
            return 'assets/images/[name]-[hash:8].[ext]';
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return 'assets/fonts/[name]-[hash:8].[ext]';
          }
          return 'assets/[name]-[hash:8].[ext]';
        },
        // Optimize entry file names
<<<<<<< HEAD
        entryFileNames: 'assets/[name]-[hash].js',
        // Ensure proper format and MIME type
        format: 'es',
=======
        entryFileNames: 'assets/js/[name]-[hash:8].js',
        // Ensure proper format
        format: 'es'
>>>>>>> d1772ed0fc6a5314995b443054ba13de8b6a1102
      },
    },
    
    // Performance optimizations
    chunkSizeWarningLimit: 500, // 500kb chunks (reduced from 600kb)
    sourcemap: false, // Disable source maps in production for smaller bundle
    minify: 'terser',
    
    // Enhanced Terser configuration for better compression
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true, // Remove debugger statements
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'], // Remove specific console methods
        passes: 3, // Multiple passes for better compression (increased from 2)
        dead_code: true, // Remove dead code
        unused: true, // Remove unused variables
        conditionals: true, // Optimize if-s and conditional expressions
        comparisons: true, // Optimize comparisons
        evaluate: true, // Evaluate constant expressions
        booleans: true, // Optimize boolean expressions
        loops: true, // Optimize loops
        hoist_funs: true, // Hoist function declarations
        keep_fargs: false, // Don't keep unused function arguments
        hoist_vars: false, // Don't hoist variable declarations
        if_return: true, // Optimize if/return and if/continue
        join_vars: true, // Join consecutive var statements
        side_effects: false, // Pass false to disable dropping function calls
      },
      mangle: {
        safari10: true, // Safari 10 compatibility
        properties: {
          regex: /^_/, // Mangle properties starting with underscore
        },
      },
      format: {
        comments: false, // Remove comments
        ascii_only: true, // Ensure ASCII output
      },
    },
    
    // CSS optimization
    cssCodeSplit: true, // Split CSS into separate files
    cssMinify: true,
    
    // Asset optimization
    assetsInlineLimit: 2048, // Inline assets smaller than 2kb (reduced from 4kb)
    
    // Preload modules for better performance
    modulePreload: {
      polyfill: false, // Use our own polyfill
    },
    
    // Enable experimental optimizations
    experimental: {
      renderBuiltUrl(filename, { hostType }) {
        if (hostType === 'js') {
          return { js: `"${filename}"` }
        } else {
          return { relative: true }
        }
      }
    },
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material/Button',
      '@mui/material/TextField',
      '@mui/material/Typography',
      '@mui/material/Container',
      '@mui/material/Grid',
      '@mui/material/Card',
      '@mui/material/CardContent',
      '@mui/material/AppBar',
      '@mui/material/Toolbar',
      'axios',
      'dayjs',
    ],
    exclude: [
      // Exclude large dependencies that should be lazy loaded
      '@mui/x-date-pickers',
      '@mui/icons-material',
      '@stripe/stripe-js',
      'razorpay',
    ],
    // Force optimization for better cold start
    force: true,
  },
  
  // Performance hints
  esbuild: {
    // Drop debugger and console in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    // Minify identifiers
    minifyIdentifiers: true,
    // Minify syntax
    minifySyntax: true,
    // Minify whitespace
    minifyWhitespace: true,
    // Ensure proper JS output
    target: 'es2020',
  },
  
  // CSS optimization
  css: {
    devSourcemap: false, // Disable CSS source maps in development for faster builds
    preprocessorOptions: {
      scss: {
        // Add global SCSS variables if needed
        additionalData: ``,
      },
    },
    // Enable CSS modules for better optimization
    modules: {
      localsConvention: 'camelCase',
    },
  },
  
  // Enhanced experimental features for better performance
  experimental: {
    // Enable build time optimizations
    buildAdvancedBaseOptions: true,
  },
  
  // Define environment variables for build optimization and better tree shaking
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __PROD__: JSON.stringify(process.env.NODE_ENV === 'production'),
    // Remove global process variable in production
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
  },
});