import jsonapiSerializer from 'jsonapi-serializer';

import { tutorialEvaluationAttributes } from '../../../../../lib/infrastructure/serializers/jsonapi/tutorial-evaluation-attributes.js';
import { userSavedTutorialAttributes } from '../../../../../lib/infrastructure/serializers/jsonapi/user-saved-tutorial-attributes.js';

const { Serializer } = jsonapiSerializer;

const serialize = function (tutorial = {}, pagination) {
  return new Serializer('tutorials', {
    attributes: [
      'duration',
      'format',
      'link',
      'source',
      'title',
      'tubeName',
      'tubePracticalTitle',
      'tubePracticalDescription',
      'tutorialEvaluation',
      'userSavedTutorial',
      'skillId',
    ],
    tutorialEvaluation: tutorialEvaluationAttributes,
    userSavedTutorial: userSavedTutorialAttributes,
    typeForAttribute(attribute) {
      if (attribute === 'userSavedTutorial') return 'user-saved-tutorial';
      return attribute;
    },
    meta: pagination,
  }).serialize(tutorial);
};

export { serialize };
