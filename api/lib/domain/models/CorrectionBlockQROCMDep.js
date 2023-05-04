class CorrectionBlockQROCMDep {
  /**
   * @type {boolean}
   */
  #validated;

  get validated() {
    return this.#validated;
  }

  /**
   * @type {string[]}
   */
  #alternativeSolutions;

  get alternativeSolutions() {
    return this.#alternativeSolutions;
  }

  set alternativeSolutions(alternativeSolutions) {
    this.assertAlternativeSolutionsIsAnArrayOfString(alternativeSolutions);
    this.#alternativeSolutions = alternativeSolutions;
  }

  /**
   * @param validated
   * @param alternativeSolutions
   */
  constructor(validated = false, alternativeSolutions = []) {
    this.assertAlternativeSolutionsIsAnArrayOfString(alternativeSolutions);

    this.#validated = validated;
    this.#alternativeSolutions = alternativeSolutions;
  }

  assertAlternativeSolutionsIsAnArrayOfString(alternativeSolutions) {
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
