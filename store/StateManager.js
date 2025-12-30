/**
 * StateManager - Redux/Zustand-inspired state management for Vanilla JS
 *
 * Features:
 * - Single source of truth
 * - Immutable state updates
 * - Subscription-based reactivity
 * - Middleware support (logging, validation)
 * - Time-travel debugging support
 *
 * @example
 * const store = new StateManager({ count: 0 });
 * store.subscribe((newState) => console.log('State:', newState));
 * store.setState({ count: 1 });
 */
class StateManager {
  constructor(initialState = {}, options = {}) {
    // Private state (closure pattern)
    this._state = this._deepFreeze({ ...initialState });
    this._previousStates = []; // For time-travel debugging
    this._listeners = new Set(); // Subscribers
    this._middlewares = []; // Middleware pipeline

    // Options
    this._options = {
      enableLogging: options.enableLogging ?? false,
      enableValidation: options.enableValidation ?? true,
      maxHistorySize: options.maxHistorySize ?? 50,
      enableTimeTravel: options.enableTimeTravel ?? false,
      ...options
    };

    // Built-in middleware
    if (this._options.enableLogging) {
      this.use(this._loggingMiddleware.bind(this));
    }
    if (this._options.enableValidation) {
      this.use(this._validationMiddleware.bind(this));
    }
  }

  /**
   * Get current state (read-only)
   * @returns {Object} Current state
   */
  getState() {
    return this._state;
  }

  /**
   * Update state immutably
   * @param {Function|Object} updater - Function (prevState) => newState or partial state object
   * @param {string} actionType - Optional action type for debugging
   * @returns {Object} New state
   */
  setState(updater, actionType = 'UPDATE') {
    const prevState = this._state;

    // Calculate new state
    let nextState;
    if (typeof updater === 'function') {
      nextState = updater(prevState);
    } else {
      nextState = { ...prevState, ...updater };
    }

    // Run middleware pipeline
    const action = { type: actionType, payload: updater };
    for (const middleware of this._middlewares) {
      const result = middleware(prevState, nextState, action);
      if (result === false) {
        // Middleware cancelled update
        console.warn(`State update cancelled by middleware: ${action.type}`);
        return prevState;
      }
      if (result && typeof result === 'object') {
        nextState = result; // Middleware modified state
      }
    }

    // Freeze new state (immutability)
    this._state = this._deepFreeze(nextState);

    // Save to history
    if (this._options.enableTimeTravel) {
      this._previousStates.push({
        state: prevState,
        action,
        timestamp: Date.now()
      });

      // Limit history size
      if (this._previousStates.length > this._options.maxHistorySize) {
        this._previousStates.shift();
      }
    }

    // Notify subscribers
    this._notifyListeners(this._state, prevState, action);

    return this._state;
  }

  /**
   * Subscribe to state changes
   * @param {Function} listener - Callback (newState, prevState, action) => void
   * @param {Function} selector - Optional selector to filter updates
   * @returns {Function} Unsubscribe function
   */
  subscribe(listener, selector = null) {
    const wrappedListener = selector
      ? (newState, prevState, action) => {
          const newValue = selector(newState);
          const prevValue = selector(prevState);
          if (newValue !== prevValue) {
            listener(newState, prevState, action);
          }
        }
      : listener;

    this._listeners.add(wrappedListener);

    // Return unsubscribe function
    return () => {
      this._listeners.delete(wrappedListener);
    };
  }

  /**
   * Add middleware
   * @param {Function} middleware - (prevState, nextState, action) => nextState|false|void
   */
  use(middleware) {
    this._middlewares.push(middleware);
  }

  /**
   * Batch multiple updates into one notification
   * @param {Array<Function|Object>} updates - Array of updaters
   */
  batchUpdate(updates) {
    const finalState = updates.reduce((state, update) => {
      if (typeof update === 'function') {
        return update(state);
      }
      return { ...state, ...update };
    }, this._state);

    this._state = this._deepFreeze(finalState);
    this._notifyListeners(this._state, this._state, { type: 'BATCH_UPDATE' });
  }

  /**
   * Time-travel debugging: undo last action
   */
  undo() {
    if (!this._options.enableTimeTravel || this._previousStates.length === 0) {
      console.warn('Cannot undo: time-travel not enabled or no history');
      return;
    }

    const previous = this._previousStates.pop();
    this._state = this._deepFreeze(previous.state);
    this._notifyListeners(this._state, previous.state, { type: 'UNDO' });
  }

  /**
   * Get state history
   * @returns {Array} History of state changes
   */
  getHistory() {
    return this._previousStates.map(h => ({
      action: h.action,
      timestamp: h.timestamp
    }));
  }

  /**
   * Deep freeze object for immutability
   * @private
   */
  _deepFreeze(obj) {
    if (!obj || typeof obj !== 'object') return obj;

    Object.freeze(obj);
    Object.values(obj).forEach(value => {
      if (typeof value === 'object' && value !== null) {
        this._deepFreeze(value);
      }
    });

    return obj;
  }

  /**
   * Notify all subscribers
   * @private
   */
  _notifyListeners(newState, prevState, action) {
    this._listeners.forEach(listener => {
      try {
        listener(newState, prevState, action);
      } catch (error) {
        console.error('Error in state listener:', error);
      }
    });
  }

  /**
   * Built-in logging middleware
   * @private
   */
  _loggingMiddleware(prevState, nextState, action) {
    console.group(`🔄 State Update: ${action.type}`);
    console.log('Previous State:', prevState);
    console.log('Action:', action);
    console.log('Next State:', nextState);
    console.groupEnd();
  }

  /**
   * Built-in validation middleware
   * @private
   */
  _validationMiddleware(prevState, nextState, action) {
    // Validate state structure
    const requiredKeys = [
      'texts', 'checkboxes', 'status', 'forms', 'ui'
    ];

    for (const key of requiredKeys) {
      if (!(key in nextState)) {
        console.error(`Validation failed: Missing required key "${key}"`);
        return false; // Cancel update
      }
    }

    return nextState;
  }
}

export default StateManager;
