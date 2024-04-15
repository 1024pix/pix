import jsonapiSerializer from 'jsonapi-serializer';

import { UserSavedTutorial } from '../../../domain/models/UserSavedTutorial.js';
import { tutorialAttributes } from './tutorial-attributes.js';

const { Serializer } = jsonapiSerializer;

const serialize = function (userTutorial) {
  return new Serializer('user-saved-tutorial', {
    attributes: ['tutorial', 'userId', 'tutorialId', 'skillId', 'updatedAt'],
    tutorial: tutorialAttributes,
  }).serialize(userTutorial);
};

const deserialize = function (json) {
  return new UserSavedTutorial({
    id: json?.data.id,
    skillId: json?.data.attributes['skill-id'],
  });
};

export { deserialize, serialize };
