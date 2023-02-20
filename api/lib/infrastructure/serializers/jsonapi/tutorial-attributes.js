import tutorialEvaluationAttributes from './tutorial-evaluation-attributes';
import userSavedTutorialAttributes from './user-saved-tutorial-attributes';

export default {
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
