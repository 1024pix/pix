import { randomUUID } from 'node:crypto';

import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = (simulation) =>
  new Serializer('knowledge-state-simulation', {
    attributes: [
      'knowledgeElementCount',
      'knowledgeStateCount',
      'knowledgeStates',
      'userCompetenceScores',
      'pixScore',
      'pixScoreAfterMigration',
      'unknownSkillIds',
    ],
    transform: (simulation) => ({ ...simulation, id: randomUUID() }),
  }).serialize(simulation);

export const knowledgeStateSimulationSerializer = { serialize };
