import { Serializer } from 'jsonapi-serializer';
import { tutorial } from './tutorial-attributes.js';
import { UserSavedTutorial } from '../../../domain/models/UserSavedTutorial.js';

const serialize = function (userTutorial) {
  return new Serializer('user-saved-tutorial', {
    attributes: ['tutorial', 'userId', 'tutorialId', 'skillId', 'updatedAt'],
    tutorial,
  }).serialize(userTutorial);
};

const deserialize = function (json) {
  return new UserSavedTutorial({
    id: json?.data.id,
    skillId: json?.data.attributes['skill-id'],
  });
};

export { serialize, deserialize };
