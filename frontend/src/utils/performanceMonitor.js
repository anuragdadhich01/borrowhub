// Performance monitoring and analytics utilities
export class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoad: {},
      userInteractions: [],
      apiCalls: [],
      errors: [],
      vitals: {}
    };
    
    this.init();
  }

  init() {
    if (typeof window === 'undefined') return;
    
    // Monitor page load performance
    this.measurePageLoad();
    
    // Monitor Web Vitals
    this.measureWebVitals();
    
    // Monitor API calls
    this.monitorApiCalls();
    
    // Monitor errors
    this.monitorErrors();
    
    // Monitor user interactions
    this.monitorUserInteractions();
  }

  measurePageLoad() {
    window.addEventListener('load', () => {
      if ('performance' in window) {
        const navTiming = performance.getEntriesByType('navigation')[0];
        
        this.metrics.pageLoad = {
          // Time to First Byte
          ttfb: navTiming.responseStart - navTiming.fetchStart,
          
          // DOM Content Loaded
          domContentLoaded: navTiming.domContentLoadedEventEnd - navTiming.fetchStart,
          
          // Full page load
          loadComplete: navTiming.loadEventEnd - navTiming.fetchStart,
          
          // DNS lookup time
          dnsTime: navTiming.domainLookupEnd - navTiming.domainLookupStart,
          
          // Connection time
          connectionTime: navTiming.connectEnd - navTiming.connectStart,
          
          // Request/Response time
          requestTime: navTiming.responseEnd - navTiming.requestStart,
          
          // DOM processing time
          domProcessingTime: navTiming.domComplete - navTiming.domLoading,
          
          timestamp: Date.now()
        };
        
        // Log performance metrics
        console.log('Page Load Metrics:', this.metrics.pageLoad);
        
        // Alert if page load is slow
        if (this.metrics.pageLoad.loadComplete > 3000) {
          console.warn('Slow page load detected:', this.metrics.pageLoad.loadComplete + 'ms');
        }
      }
    });
  }

  measureWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          
          this.metrics.vitals.lcp = {
            value: lastEntry.startTime,
            element: lastEntry.element?.tagName || 'unknown',
            timestamp: Date.now()
          };
          
          console.log('LCP:', this.metrics.vitals.lcp.value + 'ms');
          
          if (this.metrics.vitals.lcp.value > 2500) {
            console.warn('Poor LCP detected:', this.metrics.vitals.lcp.value + 'ms');
          }
        });
        
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP monitoring not supported');
      }
      
      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            this.metrics.vitals.fid = {
              value: entry.processingStart - entry.startTime,
              timestamp: Date.now()
            };
            
            console.log('FID:', this.metrics.vitals.fid.value + 'ms');
            
            if (this.metrics.vitals.fid.value > 100) {
              console.warn('Poor FID detected:', this.metrics.vitals.fid.value + 'ms');
            }
          });
        });
        
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID monitoring not supported');
      }
      
      // Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          
          this.metrics.vitals.cls = {
            value: clsValue,
            timestamp: Date.now()
          };
          
          console.log('CLS:', this.metrics.vitals.cls.value);
          
          if (this.metrics.vitals.cls.value > 0.1) {
            console.warn('Poor CLS detected:', this.metrics.vitals.cls.value);
          }
        });
        
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS monitoring not supported');
      }
    }
  }

  monitorApiCalls() {
    // Monkey patch fetch to monitor API calls
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0];
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.metrics.apiCalls.push({
          url,
          method: args[1]?.method || 'GET',
          status: response.status,
          duration,
          timestamp: Date.now(),
          success: response.ok
        });
        
        // Log slow API calls
        if (duration > 2000) {
          console.warn('Slow API call detected:', { url, duration: duration + 'ms' });
        }
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        this.metrics.apiCalls.push({
          url,
          method: args[1]?.method || 'GET',
          duration,
          timestamp: Date.now(),
          success: false,
          error: error.message
        });
        
        throw error;
      }
    };
  }

  monitorErrors() {
    // JavaScript errors
    window.addEventListener('error', (event) => {
      this.metrics.errors.push({
        type: 'javascript',
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack,
        timestamp: Date.now()
      });
      
      console.error('JavaScript error:', event.error);
    });
    
    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.metrics.errors.push({
        type: 'promise',
        message: event.reason?.message || event.reason,
        stack: event.reason?.stack,
        timestamp: Date.now()
      });
      
      console.error('Unhandled promise rejection:', event.reason);
    });
    
    // Resource loading errors
    window.addEventListener('error', (event) => {
      if (event.target !== window) {
        this.metrics.errors.push({
          type: 'resource',
          element: event.target.tagName,
          source: event.target.src || event.target.href,
          message: 'Failed to load resource',
          timestamp: Date.now()
        });
        
        console.error('Resource loading error:', event.target);
      }
    }, true);
  }

  monitorUserInteractions() {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.metrics.userInteractions.push({
        type: 'visibility',
        visible: !document.hidden,
        timestamp: Date.now()
      });
    });
    
    // Track clicks
    document.addEventListener('click', (event) => {
      this.metrics.userInteractions.push({
        type: 'click',
        element: event.target.tagName,
        className: event.target.className,
        timestamp: Date.now()
      });
    });
    
    // Track form submissions
    document.addEventListener('submit', (event) => {
      this.metrics.userInteractions.push({
        type: 'form_submit',
        form: event.target.id || event.target.className,
        timestamp: Date.now()
      });
    });
  }

  // Get current metrics
  getMetrics() {
    return {
      ...this.metrics,
      memory: this.getMemoryUsage(),
      connection: this.getConnectionInfo()
    };
  }

  getMemoryUsage() {
    if ('memory' in performance) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  }

  getConnectionInfo() {
    if ('connection' in navigator) {
      return {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData
      };
    }
    return null;
  }

  // Send metrics to analytics service
  sendMetrics() {
    const metrics = this.getMetrics();
    
    // In a real app, you would send this to your analytics service
    console.log('Performance Metrics:', metrics);
    
    // Example: Send to Google Analytics or custom endpoint
    if (typeof gtag !== 'undefined') {
      gtag('event', 'performance_metrics', {
        page_load_time: metrics.pageLoad.loadComplete,
        lcp: metrics.vitals.lcp?.value,
        fid: metrics.vitals.fid?.value,
        cls: metrics.vitals.cls?.value
      });
    }
    
    return metrics;
  }

  // Generate performance report
  generateReport() {
    const metrics = this.getMetrics();
    const report = {
      summary: {
        pageLoadTime: metrics.pageLoad.loadComplete,
        isGoodPerformance: this.isGoodPerformance(metrics),
        recommendations: this.getRecommendations(metrics)
      },
      details: metrics
    };
    
    return report;
  }

  isGoodPerformance(metrics) {
    const checks = {
      pageLoad: metrics.pageLoad.loadComplete < 3000,
      lcp: !metrics.vitals.lcp || metrics.vitals.lcp.value < 2500,
      fid: !metrics.vitals.fid || metrics.vitals.fid.value < 100,
      cls: !metrics.vitals.cls || metrics.vitals.cls.value < 0.1,
      errors: metrics.errors.length === 0
    };
    
    const passedChecks = Object.values(checks).filter(Boolean).length;
    return passedChecks >= 4; // At least 4 out of 5 checks should pass
  }

  getRecommendations(metrics) {
    const recommendations = [];
    
    if (metrics.pageLoad.loadComplete > 3000) {
      recommendations.push('Optimize page load time - currently ' + Math.round(metrics.pageLoad.loadComplete) + 'ms');
    }
    
    if (metrics.vitals.lcp && metrics.vitals.lcp.value > 2500) {
      recommendations.push('Improve Largest Contentful Paint - currently ' + Math.round(metrics.vitals.lcp.value) + 'ms');
    }
    
    if (metrics.vitals.fid && metrics.vitals.fid.value > 100) {
      recommendations.push('Reduce First Input Delay - currently ' + Math.round(metrics.vitals.fid.value) + 'ms');
    }
    
    if (metrics.vitals.cls && metrics.vitals.cls.value > 0.1) {
      recommendations.push('Minimize Cumulative Layout Shift - currently ' + metrics.vitals.cls.value.toFixed(3));
    }
    
    if (metrics.errors.length > 0) {
      recommendations.push(`Fix ${metrics.errors.length} JavaScript errors`);
    }
    
    const slowApiCalls = metrics.apiCalls.filter(call => call.duration > 2000);
    if (slowApiCalls.length > 0) {
      recommendations.push(`Optimize ${slowApiCalls.length} slow API calls`);
    }
    
    return recommendations;
  }
}

// Create global performance monitor instance
export const performanceMonitor = new PerformanceMonitor();

// Hook for React components to track rendering performance
export const usePerformanceTracker = (componentName) => {
  const renderStart = performance.now();
  
  React.useEffect(() => {
    const renderEnd = performance.now();
    const renderTime = renderEnd - renderStart;
    
    console.log(`${componentName} render time:`, renderTime + 'ms');
    
    if (renderTime > 100) {
      console.warn(`Slow render detected in ${componentName}:`, renderTime + 'ms');
    }
  });
};

// Function to track custom events
export const trackEvent = (eventName, data = {}) => {
  performanceMonitor.metrics.userInteractions.push({
    type: 'custom_event',
    name: eventName,
    data,
    timestamp: Date.now()
  });
  
  console.log('Custom event tracked:', eventName, data);
};

// Function to mark important timings
export const markTiming = (name) => {
  if ('performance' in window && 'mark' in performance) {
    performance.mark(name);
  }
};

export const measureTiming = (name, startMark, endMark) => {
  if ('performance' in window && 'measure' in performance) {
    try {
      performance.measure(name, startMark, endMark);
      const measure = performance.getEntriesByName(name)[0];
      console.log(`${name}:`, measure.duration + 'ms');
      return measure.duration;
    } catch (e) {
      console.warn('Could not measure timing:', name);
      return 0;
    }
  }
  return 0;
};

export default performanceMonitor;