const _ = require('lodash');

class Correction {

  constructor({
    id,
    solution,
    solutionToDisplay,
    hints = [],
    tutorials = [],
    learningMoreTutorials = [],
  } = {}) {
    this.id = id;
    this.solution = solution;
    this.solutionToDisplay = solutionToDisplay;
    this.hints = hints;
    this.tutorials = tutorials;
    this.learningMoreTutorials = learningMoreTutorials;
  }

  get relevantHint() {
    const hintsToSort = Array.from(this.hints);
    return _.minBy(hintsToSort, 'skillName');
  }
}

module.exports = Correction;
