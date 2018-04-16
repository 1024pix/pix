class Solution {

  constructor({
    id, type, value, enabledTreatments, scoring
  } = {}) {
    this.id = id;
    this.type = type;
    this.value = value;
    this.enabledTreatments = enabledTreatments;
    this.scoring = scoring;
  }

  // TODO: delete when deactivation object is correctly deleted everywhere
  /**
   * @deprecated use the enabledTreatments property
   */
  get deactivations() {
    return {
      t1: !this.enabledTreatments.includes('t1'),
      t2: !this.enabledTreatments.includes('t2'),
      t3: !this.enabledTreatments.includes('t3')
    };
  }
}

module.exports = Solution;
