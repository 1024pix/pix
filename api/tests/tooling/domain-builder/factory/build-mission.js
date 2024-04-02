import { Mission } from '../../../../src/school/domain/models/Mission.js';

const buildMission = function buildMission({
  id = 'recThem1',
  name = 'My Mission',
  competenceId = 'competenceId',
  competenceName = 'competenceName',
  thematicId = 'thematicId',
  learningObjectives = 'learningObjectives',
  validatedObjectives = 'validatedObjectives',
  areaCode = 1,
  startedBy = 'CM2',
  content,
} = {}) {
  return new Mission({
    id,
    name,
    competenceId,
    competenceName,
    thematicId,
    learningObjectives,
    validatedObjectives,
    areaCode,
    startedBy,
    content,
  });
};

export { buildMission };
