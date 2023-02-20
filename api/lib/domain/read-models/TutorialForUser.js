import Tutorial from '../models/Tutorial';

class TutorialForUser extends Tutorial {
  constructor({ userSavedTutorial, tutorialEvaluation, skillId, ...tutorial }) {
    super(tutorial);
    this.userSavedTutorial = userSavedTutorial;
    this.tutorialEvaluation = tutorialEvaluation;
    this.skillId = skillId;
  }
}

export default TutorialForUser;
