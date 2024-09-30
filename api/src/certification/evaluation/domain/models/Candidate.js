export class Candidate {
  /**
   * @param {Object} params
   * @param {boolean} [params.accessibilityAdjustmentNeeded]
   */
  constructor({ accessibilityAdjustmentNeeded } = {}) {
    this.accessibilityAdjustmentNeeded = !!accessibilityAdjustmentNeeded;
  }
}
