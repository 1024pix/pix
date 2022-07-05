const Tutorial = require('../models/Tutorial');

class TutorialForUser extends Tutorial {
  constructor({ userTutorial, tutorialEvaluation, skillId, ...tutorial }) {
    super(tutorial);
    this.userTutorial = userTutorial;
    this.tutorialEvaluation = tutorialEvaluation;
    this.skillId = skillId;
  }
}

module.exports = TutorialForUser;
