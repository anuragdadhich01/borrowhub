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
    target: 'es2018', // Better browser support while maintaining performance
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        // Enhanced chunking strategy
        manualChunks: {
          // Core React libraries
          vendor: ['react', 'react-dom'],
          // Router
          router: ['react-router-dom'],
          // Material UI core (using correct imports)
          'mui-core': ['@mui/material', '@emotion/react', '@emotion/styled'],
          // Material UI icons
          'mui-icons': ['@mui/icons-material'],
          // Date picker
          'date-picker': ['@mui/x-date-pickers'],
          // Utilities
          utils: ['axios', 'dayjs'],
          // Payment libraries
          payments: ['@stripe/react-stripe-js', '@stripe/stripe-js', 'razorpay'],
        },
        // Optimize chunk file names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop().replace('.jsx', '').replace('.js', '')
            : 'chunk';
          return `assets/${facadeModuleId}-[hash].js`;
        },
        // Optimize asset file names  
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'assets/styles-[hash].css';
          }
          return 'assets/[name]-[hash].[ext]';
        },
        // Optimize entry file names
        entryFileNames: 'assets/[name]-[hash].js',
        // Ensure proper format and MIME type
        format: 'es',
      },
    },
    
    // Performance optimizations
    chunkSizeWarningLimit: 600, // 600kb chunks
    sourcemap: false, // Disable source maps in production for smaller bundle
    minify: 'terser',
    
    // Terser configuration for better compression
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true, // Remove debugger statements
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // Remove specific console methods
        passes: 2, // Multiple passes for better compression
      },
      mangle: {
        safari10: true, // Safari 10 compatibility
      },
      format: {
        comments: false, // Remove comments
      },
    },
    
    // CSS optimization
    cssCodeSplit: true, // Split CSS into separate files
    cssMinify: true,
    
    // Asset optimization
    assetsInlineLimit: 4096, // Inline assets smaller than 4kb
    
    // Preload modules for better performance
    modulePreload: {
      polyfill: false, // Use our own polyfill
    },
  },
  
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
      'axios',
      'dayjs'
    ],
    exclude: [
      // Exclude large dependencies that should be lazy loaded
      '@mui/x-date-pickers'
    ],
  },
  
  // Performance hints
  esbuild: {
    // Drop debugger and console in production
    drop: ['console', 'debugger'],
    // Minify identifiers
    minifyIdentifiers: true,
    // Minify syntax
    minifySyntax: true,
    // Minify whitespace
    minifyWhitespace: true,
    // Ensure proper JS output
    target: 'es2018',
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
  },
  
  // Experimental features for better performance
  experimental: {
    // Enable build time optimizations
    buildAdvancedBaseOptions: true,
  },
  
  // Define environment variables for build optimization
  define: {
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development'),
    __PROD__: JSON.stringify(process.env.NODE_ENV === 'production'),
  },
});