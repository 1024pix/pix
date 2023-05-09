class CorrectionBlockQROCMDep {
  /**
   * @type {boolean}
   */
  #validated;

  /**
   * @type {string[]}
   */
  #alternativeSolutions;

  /**
   * @param {boolean} validated
   * @param {string[]} alternativeSolutions
   */
  constructor(validated = false, alternativeSolutions = []) {
    this.#validateValidatedArgument(validated);
    this.#validateAlternativeSolutionsArgument(alternativeSolutions);

    this.#validated = validated;
    this.#alternativeSolutions = alternativeSolutions;
  }

  /**
   * @returns {boolean}
   */
  get validated() {
    return this.#validated;
  }

  /**
   * @returns {string[]}
   */
  get alternativeSolutions() {
    return this.#alternativeSolutions;
  }

  /**
   * @param {string[]} alternativeSolutions
   */
  set alternativeSolutions(alternativeSolutions) {
    this.#validateAlternativeSolutionsArgument(alternativeSolutions);
    this.#alternativeSolutions = alternativeSolutions;
  }

  /**
   * @param {boolean} validated
   */
  #validateValidatedArgument(validated) {
    if (typeof validated !== 'boolean') {
      throw new Error('alternativeSolutions must be an array');
    }
  }

  /**
   * @param {string[]} alternativeSolutions
   */
  #validateAlternativeSolutionsArgument(alternativeSolutions) {
    if (!Array.isArray(alternativeSolutions)) {
      throw new Error('alternativeSolutions must be an array');
    }

    for (const alternativeSolution of alternativeSolutions) {
      if (typeof alternativeSolution !== 'string') {
        throw new Error('alternativeSolutions must be an array of strings');
      }
    }
  }
}

module.exports = CorrectionBlockQROCMDep;
