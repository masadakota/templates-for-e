/**
 * Application Entry Point
 *
 * Initializes the StateManager and bridges it with the existing templates.js code.
 * This allows gradual migration from the old global state to the new state management system.
 */

import StateManager from '../store/StateManager.js';
import { createInitialState } from '../store/initialState.js';

/**
 * Initialize the application
 */
async function initializeApp() {
  // Get CONFIG from defaults.js (loaded via script tag)
  const config = typeof CONFIG !== 'undefined' ? CONFIG : {};

  // Create initial state
  const initialState = createInitialState(config);

  // Initialize StateManager with logging enabled for debugging
  const store = new StateManager(initialState, {
    enableLogging: false, // Set to true for debugging
    enableValidation: true,
    enableTimeTravel: true,
    maxHistorySize: 50
  });

  // Make store globally accessible for debugging (file:// protocol safe)
  window.__STORE__ = store;
  console.log('✅ StateManager initialized. Access via window.__STORE__');

  // Subscribe to state changes for debugging
  if (store._options.enableLogging) {
    store.subscribe((newState, prevState, action) => {
      console.log('State changed:', action.type);
    });
  }

  // Backward compatibility: Sync with old global state if it exists
  if (typeof state !== 'undefined') {
    console.log('⚠️ Legacy state object detected. Setting up bidirectional sync...');
    setupLegacySync(store);
  }

  return store;
}

/**
 * Set up bidirectional sync between new StateManager and old global state
 * This is temporary during migration period
 *
 * @param {StateManager} store - The state manager instance
 */
function setupLegacySync(store) {
  // Old state -> New state (when old code updates state)
  const oldState = window.state;

  // Monitor old state changes (polling - not ideal but works for migration)
  let lastOldState = JSON.stringify(oldState);

  setInterval(() => {
    const currentOldState = JSON.stringify(oldState);
    if (currentOldState !== lastOldState) {
      console.log('📡 Legacy state changed, syncing to new store...');

      // Update new store from old state
      store.setState(prevState => ({
        ...prevState,
        texts: {
          ...prevState.texts,
          statusUrgent: oldState.statusUrgentText,
          statusNote: oldState.statusNoteText,
          statusName: oldState.statusNameText,
          statusPaid: oldState.statusPaidText,
          statusDelay: oldState.statusDelayText,
        },
        status: {
          ...prevState.status,
          dealerInformed: oldState.dealerInformed,
          paidStatus: oldState.paidStatus,
          delayStatus: oldState.delayStatus,
        }
      }), 'LEGACY_SYNC');

      lastOldState = currentOldState;
    }
  }, 100); // Check every 100ms

  // New state -> Old state (when new store updates)
  store.subscribe((newState) => {
    // Update old global state
    oldState.statusUrgentText = newState.texts.statusUrgent;
    oldState.statusNoteText = newState.texts.statusNote;
    oldState.statusNameText = newState.texts.statusName;
    oldState.statusPaidText = newState.texts.statusPaid;
    oldState.statusDelayText = newState.texts.statusDelay;
    oldState.dealerInformed = newState.status.dealerInformed;
    oldState.paidStatus = newState.status.paidStatus;
    oldState.delayStatus = newState.status.delayStatus;
  });

  console.log('✅ Legacy state sync configured');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  // DOM already loaded
  initializeApp();
}

// Export for module usage
export { initializeApp };
