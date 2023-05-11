class Correction {
  constructor({
    id,
    solution,
    solutionToDisplay,
    hint,
    tutorials = [],
    learningMoreTutorials = [],
    solutionBlocks = [],
  } = {}) {
    this.id = id;
    this.solution = solution;
    this.solutionToDisplay = solutionToDisplay;
    this.hint = hint;
    this.tutorials = tutorials;
    this.learningMoreTutorials = learningMoreTutorials;
    this.solutionBlocks = solutionBlocks;
  }
}

export { Correction };
