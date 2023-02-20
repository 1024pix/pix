import { Serializer } from 'jsonapi-serializer';
import tutorialEvaluationAttributes from './tutorial-evaluation-attributes';
import userSavedTutorialAttributes from './user-saved-tutorial-attributes';

export default {
  serialize(tutorial = {}, pagination) {
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
  },
};
