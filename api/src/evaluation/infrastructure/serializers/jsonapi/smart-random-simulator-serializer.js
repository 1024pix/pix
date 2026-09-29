import jsonapiSerializer from 'jsonapi-serializer';

import { Challenge } from '../../../../shared/domain/models/Challenge.js';
import { KnowledgeState } from '../../../../shared/domain/models/KnowledgeState.js';
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

  const skills = deserializedPayload.skills.map((skill) => new Skill(skill));

  return new SimulationParameters({
    ...deserializedPayload,
    answers: deserializedPayload.answers.map((answer) => new Answer(answer)),
    knowledgeState: KnowledgeState.fromRows(deserializedPayload.knowledgeState ?? [], { skills }),
    skills,
    challenges: deserializedPayload.challenges.map((challenge) => new Challenge(challenge)),
  });
};

export const smartRandomSimulatorSerializer = { deserialize };
