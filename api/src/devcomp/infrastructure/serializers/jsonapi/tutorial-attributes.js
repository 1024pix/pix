import { tutorialEvaluationAttributes } from './tutorial-evaluation-attributes.js';
import { userSavedTutorialAttributes } from './user-saved-tutorial-attributes.js';

const tutorialAttributes = {
  ref: 'id',
  includes: true,
  attributes: [
    'id',
    'duration',
    'format',
    'link',
    'source',
    'title',
    'tutorialEvaluation',
    'userSavedTutorial',
    'skillId',
  ],
  tutorialEvaluation: tutorialEvaluationAttributes,
  userSavedTutorial: userSavedTutorialAttributes,
};

export { tutorialAttributes };
