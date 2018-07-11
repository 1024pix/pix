function _byLowestSkillName(hintA, hintB) {
  return hintA.skillName > hintB.skillName;
}

class Correction {

  constructor({
    id,
    // attributes
    solution,
    // includes
    hints = [],
    tutorials = [],
    // references
  } = {}) {
    this.id = id;
    // attributes
    this.solution = solution;
    // includes
    this.hints = hints;
    this.tutorials = tutorials;
    // references
  }

  get relevantHint() {
    const hintsToSort = Array.from(this.hints);
    return hintsToSort.sort(_byLowestSkillName)[0];
  }
}

module.exports = Correction;
