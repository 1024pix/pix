import jsonapiSerializer from 'jsonapi-serializer';
import { SimulationParameters } from '../../../domain/models/SimulationParameters.js';
import { Answer } from '../../../domain/models/Answer.js';
import { Challenge, KnowledgeElement, Skill } from '../../../../../lib/domain/models/index.js';

const { Deserializer } = jsonapiSerializer;

/**
 * @param payload
 * @returns {Promise<SimulationParameters>}
 */
const deserialize = async function (payload) {
  const deserializedPayload = await new Deserializer({
    keyForAttribute: 'camelCase',
  }).deserialize(payload);

  return new SimulationParameters({
    ...deserializedPayload,
    answers: deserializedPayload.answers.map((answer) => new Answer(answer)),
    knowledgeElements: deserializedPayload.knowledgeElements.map(
      (knowledgeElement) => new KnowledgeElement(knowledgeElement),
    ),
    skills: deserializedPayload.skills.map((skill) => new Skill(skill)),
    challenges: deserializedPayload.challenges.map((challenge) => new Challenge(challenge)),
  });
};

export { deserialize };
