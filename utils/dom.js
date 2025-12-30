/**
 * DOM Utility Functions
 *
 * Centralized DOM manipulation helpers to reduce code duplication
 * and improve maintainability.
 */

/**
 * Get element safely with error handling
 * @param {string} id - Element ID
 * @returns {HTMLElement|null} Element or null
 */
export function getElement(id) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`Element not found: #${id}`);
  }
  return element;
}

/**
 * Get multiple elements by ID mapping
 * @param {Object} ids - Map of key to element ID
 * @returns {Object} Map of key to element
 *
 * @example
 * const elements = getElements({
 *   button: 'my-button',
 *   input: 'my-input'
 * });
 */
export function getElements(ids) {
  const elements = {};
  for (const [key, id] of Object.entries(ids)) {
    elements[key] = getElement(id);
  }
  return elements;
}

/**
 * Update element text content safely
 * @param {string} elementId - Element ID
 * @param {string} text - Text content
 */
export function updateText(elementId, text) {
  const element = getElement(elementId);
  if (element) {
    element.textContent = text;
  }
}

/**
 * Toggle element visibility
 * @param {string} elementId - Element ID
 * @param {boolean} isVisible - Visibility state
 */
export function toggleVisibility(elementId, isVisible) {
  const element = getElement(elementId);
  if (element) {
    element.style.display = isVisible ? '' : 'none';
  }
}

/**
 * Query selector with type safety
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element (default: document)
 * @returns {Element|null} Element or null
 */
export function querySelector(selector, parent = document) {
  const element = parent.querySelector(selector);
  if (!element) {
    console.warn(`Element not found: ${selector}`);
  }
  return element;
}

/**
 * Query all with array return
 * @param {string} selector - CSS selector
 * @param {Element} parent - Parent element (default: document)
 * @returns {Array<Element>} Array of elements
 */
export function querySelectorAll(selector, parent = document) {
  return Array.from(parent.querySelectorAll(selector));
}

/**
 * Set multiple attributes on an element
 * @param {HTMLElement} element - Target element
 * @param {Object} attributes - Attributes to set
 */
export function setAttributes(element, attributes) {
  if (!element) return;
  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }
}

/**
 * Add event listener with automatic cleanup
 * @param {HTMLElement} element - Target element
 * @param {string} event - Event name
 * @param {Function} handler - Event handler
 * @returns {Function} Cleanup function
 */
export function addEventListener(element, event, handler) {
  if (!element) return () => {};
  element.addEventListener(event, handler);
  return () => element.removeEventListener(event, handler);
}
