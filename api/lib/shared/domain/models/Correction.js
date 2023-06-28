class Correction {
  constructor({
    id,
    solution,
    solutionToDisplay,
    hint,
    tutorials = [],
    learningMoreTutorials = [],
    answersEvaluation = [],
    solutionsWithoutGoodAnswers = [],
  } = {}) {
    this.id = id;
    this.solution = solution;
    this.solutionToDisplay = solutionToDisplay;
    this.hint = hint;
    this.tutorials = tutorials;
    this.learningMoreTutorials = learningMoreTutorials;
    this.answersEvaluation = answersEvaluation;
    this.solutionsWithoutGoodAnswers = solutionsWithoutGoodAnswers;
  }
}

export { Correction };
