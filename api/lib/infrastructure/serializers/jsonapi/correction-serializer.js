import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;
import { tutorialAttributes } from './tutorial-attributes.js';

const serialize = function (correction) {
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
      correctionBlocks: correction.correctionBlocks.map((correctionBlock) => ({
        validated: correctionBlock.validated,
        alternativeSolutions: correctionBlock.alternativeSolutions,
      })),
    }),
    attributes: ['solution', 'solutionToDisplay', 'hint', 'tutorials', 'learningMoreTutorials', 'correctionBlocks'],
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
        case 'correctionBlocks':
          return 'correction-blocks';
        default:
          return attribute;
      }
    },
  }).serialize(correction);
};

export { serialize };
