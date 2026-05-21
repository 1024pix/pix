import { Competence } from '../../../../src/shared/domain/models/Competence.js';

const buildCompetence = function ({
  id = 'recCOMP1',
  name = 'Manger des fruits',
  index = '1.1',
  description = 'Teste les qualités de mangeage de fruits',
  areaId = 'area123',
  skillIds = [],
  thematicIds = [],
  thematics = [],
  tubes = [],
  origin = 'Pix',
} = {}) {
  return new Competence({
    id,
    name,
    index,
    description,
    origin,
    areaId,
    skillIds,
    thematicIds,
    thematics,
    tubes,
  });
};

export { buildCompetence };
