const Tutorial = require('./Tutorial');

class TutorialWithUserSavedTutorial extends Tutorial {
  constructor({ userTutorial, ...tutorial }) {
    super(tutorial);
    this.userTutorial = userTutorial;
  }
}

module.exports = TutorialWithUserSavedTutorial;
