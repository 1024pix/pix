import { Serializer } from 'jsonapi-serializer';
import tutorialAttributes from './tutorial-attributes';

export default {
  serialize(correction) {
    return new Serializer('corrections', {
      transform: (record) => ({
        ...correction,
        hint: record.hint?.value,
        tutorials: correction.tutorials.map((tutorial) => ({
          ...tutorial,
          userSavedTutorial: { ...tutorial.userSavedTutorial },
          tutorialEvaluation: { ...tutorial.tutorialEvaluation },
        })),
        learningMoreTutorials: correction.learningMoreTutorials.map((tutorial) => ({
          ...tutorial,
          userSavedTutorial: { ...tutorial.userSavedTutorial },
          tutorialEvaluation: { ...tutorial.tutorialEvaluation },
        })),
      }),
      attributes: ['solution', 'solutionToDisplay', 'hint', 'tutorials', 'learningMoreTutorials'],
      tutorials: tutorialAttributes,
      learningMoreTutorials: tutorialAttributes,
      typeForAttribute(attribute) {
        switch (attribute) {
          case 'tutorialEvaluation':
            return 'tutorial-evaluation';
          case 'userSavedTutorial':
            return 'user-saved-tutorial';
          case 'learningMoreTutorials':
            return 'tutorials';
          default:
            return attribute;
        }
      },
    }).serialize(correction);
  },
};
