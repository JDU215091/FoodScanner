// polyfills.js - Must be imported FIRST before any React Native code
// This fixes InteractionManager removal in RN 0.88+

// Polyfill for InteractionManager
const InteractionManager = {
  runAfterInteractions: (callback) => {
    return new Promise((resolve) => {
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => {
          const result = callback?.();
          resolve(result);
        });
      } else {
        setTimeout(() => {
          const result = callback?.();
          resolve(result);
        }, 0);
      }
    });
  },
  createInteractionHandle: () => 1,
  clearInteractionHandle: () => {},
  setDeadline: () => {},
};

// Inject before React Native loads
if (typeof global !== 'undefined') {
  global.InteractionManager = InteractionManager;
}

// Also patch the react-native module if it's already loaded
try {
  const RN = require('react-native');
  if (RN && !RN.InteractionManager) {
    RN.InteractionManager = InteractionManager;
    Object.defineProperty(RN, 'InteractionManager', {
      value: InteractionManager,
      writable: false,
      configurable: false,
    });
  }
} catch (e) {
  // React Native not loaded yet, that's fine
}

console.log('✅ InteractionManager polyfill loaded');
