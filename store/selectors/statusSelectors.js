/**
 * Status Selectors
 *
 * Compute derived state values efficiently.
 * These functions take the state and return computed values.
 */

/**
 * Get status display text
 * @param {Object} state - Application state
 * @returns {string} Status text ("済" or "未")
 */
export function getStatusDisplayText(state) {
  return state.status.main ? '済' : '未';
}

/**
 * Get paid status display text
 * @param {Object} state - Application state
 * @returns {string} Paid status text ("済" or "未")
 */
export function getPaidStatusDisplayText(state) {
  return state.status.paidStatus ? '済' : '未';
}

/**
 * Get delay status display text
 * @param {Object} state - Application state
 * @returns {string} Delay status text ("済" or "未")
 */
export function getDelayStatusDisplayText(state) {
  return state.status.delayStatus ? '済' : '未';
}

/**
 * Check if all statuses are complete
 * @param {Object} state - Application state
 * @returns {boolean} True if all statuses are complete
 */
export function areAllStatusesComplete(state) {
  return state.status.paidStatus && state.status.delayStatus;
}

/**
 * Check if any status is complete
 * @param {Object} state - Application state
 * @returns {boolean} True if any status is complete
 */
export function isAnyStatusComplete(state) {
  return state.status.paidStatus || state.status.delayStatus;
}

/**
 * Get checkbox indeterminate state
 * @param {Object} state - Application state
 * @returns {Object} { checked, indeterminate }
 */
export function getCheckboxIndeterminateState(state) {
  const allComplete = areAllStatusesComplete(state);
  const anyComplete = isAnyStatusComplete(state);

  if (allComplete) return { checked: true, indeterminate: false };
  if (anyComplete) return { checked: false, indeterminate: true };
  return { checked: false, indeterminate: false };
}

/**
 * Get paid display text with warranty consideration
 * @param {Object} state - Application state
 * @returns {string} Paid display text
 */
export function getPaidDisplayText(state) {
  const { paidRadio, paidMakerWarranty } = state.forms;

  if (!paidRadio) return '';

  if (paidMakerWarranty && paidRadio !== '保証対象外部位有償案内') {
    return '・メーカー保証期間内の有償警告';
  }

  return '・' + paidRadio;
}

/**
 * Get person name text for display
 * @param {Object} state - Application state
 * @returns {string} Person name text
 */
export function getPersonNameText(state) {
  if (!state.checkboxes.statusName) return '';
  return `・${state.forms.personSelect}の名前の聴取\n`;
}

/**
 * Check if paid status display should be visible
 * @param {Object} state - Application state
 * @returns {boolean} True if should be visible
 */
export function isPaidDisplayVisible(state) {
  return getPaidDisplayText(state).trim() !== '';
}
