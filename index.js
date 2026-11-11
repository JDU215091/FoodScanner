// Import polyfills FIRST before anything else
import './polyfills';

import { registerRootComponent } from 'expo';
import { Buffer } from 'buffer';

// Polyfill for Node.js Buffer in React Native
global.Buffer = Buffer;

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
