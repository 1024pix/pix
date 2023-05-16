class Correction {
  constructor({
    id,
    solution,
    solutionToDisplay,
    hint,
    tutorials = [],
    learningMoreTutorials = [],
    correctionBlocks = [],
  } = {}) {
    this.id = id;
    this.solution = solution;
    this.solutionToDisplay = solutionToDisplay;
    this.hint = hint;
    this.tutorials = tutorials;
    this.learningMoreTutorials = learningMoreTutorials;
    this.correctionBlocks = correctionBlocks;
  }
}

export { Correction };
