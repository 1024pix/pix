import jsonapiSerializer from 'jsonapi-serializer';

import { tutorialAttributes } from '../../../../devcomp/infrastructure/serializers/jsonapi/tutorial-attributes.js';

const { Serializer } = jsonapiSerializer;

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
      answersEvaluation: correction.answersEvaluation,
      solutionsWithoutGoodAnswers: correction.solutionsWithoutGoodAnswers,
    }),
    attributes: [
      'solution',
      'solutionToDisplay',
      'hint',
      'tutorials',
      'learningMoreTutorials',
      'answersEvaluation',
      'solutionsWithoutGoodAnswers',
    ],
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
        case 'answersEvaluation':
          return 'answers-evaluation';
        case 'solutionsWithoutGoodAnswers':
          return 'solutions-without-good-answers';
        default:
          return attribute;
      }
    },
  }).serialize(correction);
};

export { serialize };
