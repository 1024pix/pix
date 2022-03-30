const Tutorial = require('../models/Tutorial');

class TutorialForUser extends Tutorial {
  constructor({ userTutorial, tutorialEvaluation, ...tutorial }) {
    super(tutorial);
    this.userTutorial = userTutorial;
    this.tutorialEvaluation = tutorialEvaluation;
  }
}

module.exports = TutorialForUser;
