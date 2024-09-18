export class ConvertCenterToV3Job {
  /**
   * @param {Object} params
   * @param {number} params.centerId
   */
  constructor({ centerId }) {
    this.centerId = centerId;
    this.#validateInvariants();
  }

  #validateInvariants() {
    if (!this.centerId) {
      throw new Error('centerId is required');
    }
  }
}
