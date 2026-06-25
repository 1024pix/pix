import jsonapiSerializer from 'jsonapi-serializer';

import { Challenge } from '../../../../shared/domain/models/Challenge.js';
import { KnowledgeElement } from '../../../../shared/domain/models/KnowledgeElement.js';
import { Skill } from '../../../../shared/domain/models/Skill.js';
import { Answer } from '../../../domain/models/Answer.js';
import { SimulationParameters } from '../../../domain/models/SimulationParameters.js';

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

export const smartRandomSimulatorSerializer = { deserialize };
