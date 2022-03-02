const Tutorial = require('./Tutorial');

class TutorialWithUserSavedTutorial extends Tutorial {
  constructor(tutorial, userTutorial) {
    super(tutorial);
    this.userTutorial = userTutorial;
  }
}

module.exports = TutorialWithUserSavedTutorial;
