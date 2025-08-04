// Environment configuration manager
class EnvironmentConfig {
    constructor() {
        this.config = this.loadConfig();
        this.validateConfig();
    }
    
    loadConfig() {
        const env = import.meta.env.MODE || 'production';
        
        const baseConfig = {
            // API Configuration
            apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
            
            // Feature Flags
            enablePWA: import.meta.env.VITE_ENABLE_PWA === 'true',
            enablePerformanceMonitoring: import.meta.env.VITE_ENABLE_PERFORMANCE_MONITORING === 'true',
            enableImageOptimization: import.meta.env.VITE_ENABLE_IMAGE_OPTIMIZATION === 'true',
            enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
            
            // Service Worker
            swCacheName: import.meta.env.VITE_SW_CACHE_NAME || 'borrowhub-v1.0.0',
            
            // Security
            cspReportUri: import.meta.env.VITE_CSP_REPORT_URI,
            
            // Environment
            environment: env,
            isDevelopment: env === 'development',
            isProduction: env === 'production',
            isStaging: env === 'staging',
            
            // Debug
            debugMode: import.meta.env.VITE_DEBUG_MODE === 'true' || env === 'development',
        };
        
        // Environment-specific overrides
        const envSpecificConfig = this.getEnvironmentSpecificConfig(env);
        
        return { ...baseConfig, ...envSpecificConfig };
    }
    
    getEnvironmentSpecificConfig(env) {
        switch (env) {
            case 'development':
                return {
                    enablePWA: false, // PWA disabled in development for easier debugging
                    enableAnalytics: false, // No analytics in development
                    debugMode: true,
                    logLevel: 'debug',
                    enableMockData: true,
                };
                
            case 'staging':
                return {
                    enablePWA: true,
                    enableAnalytics: false, // No analytics in staging
                    debugMode: true,
                    logLevel: 'info',
                    enableMockData: false,
                };
                
            case 'production':
                return {
                    enablePWA: true,
                    enableAnalytics: true,
                    debugMode: false,
                    logLevel: 'error',
                    enableMockData: false,
                };
                
            default:
                return {};
        }
    }
    
    validateConfig() {
        const required = ['apiBaseUrl'];
        const missing = required.filter(key => !this.config[key]);
        
        if (missing.length > 0) {
            console.error('Missing required configuration:', missing);
            
            // Provide fallbacks for critical config
            if (!this.config.apiBaseUrl) {
                this.config.apiBaseUrl = window.location.origin;
                console.warn('Using fallback API URL:', this.config.apiBaseUrl);
            }
        }
        
        // Validate URLs
        if (this.config.apiBaseUrl) {
            try {
                new URL(this.config.apiBaseUrl);
            } catch (error) {
                console.error('Invalid API Base URL:', this.config.apiBaseUrl);
                this.config.apiBaseUrl = window.location.origin;
            }
        }
    }
    
    get(key) {
        return this.config[key];
    }
    
    getAll() {
        return { ...this.config };
    }
    
    isDev() {
        return this.config.isDevelopment;
    }
    
    isProd() {
        return this.config.isProduction;
    }
    
    isStaging() {
        return this.config.isStaging;
    }
    
    // Get API URL with optional path
    getApiUrl(path = '') {
        const baseUrl = this.config.apiBaseUrl.replace(/\/$/, '');
        const cleanPath = path.replace(/^\//, '');
        return cleanPath ? `${baseUrl}/${cleanPath}` : baseUrl;
    }
    
    // Feature flag helpers
    shouldEnableFeature(featureName) {
        const configKey = `enable${featureName.charAt(0).toUpperCase()}${featureName.slice(1)}`;
        return this.config[configKey] === true;
    }
    
    // Logging helper based on log level
    log(level, message, data = null) {
        const logLevels = {
            debug: 0,
            info: 1,
            warn: 2,
            error: 3
        };
        
        const currentLevel = logLevels[this.config.logLevel] || logLevels.error;
        const messageLevel = logLevels[level] || logLevels.info;
        
        if (messageLevel >= currentLevel) {
            const logMethod = console[level] || console.log;
            if (data) {
                logMethod(`[${level.toUpperCase()}]`, message, data);
            } else {
                logMethod(`[${level.toUpperCase()}]`, message);
            }
        }
    }
    
    // Debug helper
    debug(message, data = null) {
        if (this.config.debugMode) {
            this.log('debug', message, data);
        }
    }
    
    // Get configuration for service worker
    getServiceWorkerConfig() {
        return {
            cacheName: this.config.swCacheName,
            apiBaseUrl: this.config.apiBaseUrl,
            enablePWA: this.config.enablePWA,
            debugMode: this.config.debugMode
        };
    }
    
    // Export config for debugging
    exportConfig() {
        if (this.isDev()) {
            return this.getAll();
        }
        
        // In production, only export non-sensitive config
        const { apiBaseUrl, environment, enablePWA, ...safeConfig } = this.getAll();
        return {
            ...safeConfig,
            environment,
            enablePWA,
            apiBaseUrl: apiBaseUrl.replace(/\/\/[^\/]+/, '//***') // Mask domain in prod
        };
    }
}

// Create singleton instance
const environmentConfig = new EnvironmentConfig();

// Export for use throughout the app
export default environmentConfig;

// Export specific helpers
export const {
    isDev: isDevelopment,
    isProd: isProduction,
    isStaging,
    debug,
    log,
    getApiUrl,
    shouldEnableFeature
} = environmentConfig;