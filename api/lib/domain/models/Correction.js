function _byLowestSkillName(hintA, hintB) {
  return hintA.skillName > hintB.skillName;
}

class Correction {

  constructor({
    id,
    // attributes
    solution,
    // embedded
    hints = [],
    tutorials = [],
    // relations
  } = {}) {
    this.id = id;
    // attributes
    this.solution = solution;
    // embedded
    this.hints = hints;
    this.tutorials = tutorials;
    // relations
  }

  get relevantHint() {
    const hintsToSort = Array.from(this.hints);
    return hintsToSort.sort(_byLowestSkillName)[0];
  }
}

module.exports = Correction;
