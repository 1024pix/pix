import { Tutorial } from '../models/Tutorial.js';

class TutorialForUser extends Tutorial {
  constructor({ userSavedTutorial, tutorialEvaluation, skillId, ...tutorial }) {
    super(tutorial);
    this.userSavedTutorial = userSavedTutorial;
    this.tutorialEvaluation = tutorialEvaluation;
    this.skillId = skillId;
  }
}

export { TutorialForUser };
