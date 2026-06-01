import jsonapiSerializer from 'jsonapi-serializer';

import { REWARD_TYPES } from '../../domain/constants.js';
import { AdminCombinedCourseBlueprint } from '../../domain/models/AdminCombinedCourseBlueprint.js';
import { QuestInput } from '../../domain/models/QuestInput.js';

const { Deserializer, Serializer } = jsonapiSerializer;

const serialize = function (combinedCourseBlueprint) {
  return new Serializer('combined-course-blueprints', {
    attributes: ['name', 'internalName', 'description', 'illustration', 'surveyLink', 'createdAt', 'updatedAt'],
  }).serialize(combinedCourseBlueprint);
};

const deserialize = async function (payload) {
  const deserializedData = await new Deserializer({
    keyForAttribute: 'camelCase',
  }).deserialize(payload);
  const questInput = new QuestInput({
    items: deserializedData.content ?? [],
    rewardId: deserializedData.rewardId,
    rewardType: REWARD_TYPES[deserializedData.rewardType] ?? null,
  });
  return new AdminCombinedCourseBlueprint({
    ...deserializedData,
    quest: questInput.toQuest(),
  });
};

export { deserialize, serialize };
