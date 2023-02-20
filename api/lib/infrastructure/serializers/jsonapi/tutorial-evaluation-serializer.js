import { Serializer } from 'jsonapi-serializer';
import tutorial from './tutorial-attributes.js';
import TutorialEvaluation from '../../../domain/models/TutorialEvaluation';

export default {
  serialize(tutorialEvaluation) {
    return new Serializer('tutorial-evaluation', {
      attributes: ['tutorial', 'userId', 'tutorialId', 'status', 'updatedAt'],
      tutorial,
    }).serialize(tutorialEvaluation);
  },

  deserialize(json) {
    return new TutorialEvaluation({
      id: json?.data.id,
      userId: json?.data.attributes['user-id'],
      tutorialId: json?.data.attributes['tutorial-id'],
      status: json?.data.attributes.status,
    });
  },
};
