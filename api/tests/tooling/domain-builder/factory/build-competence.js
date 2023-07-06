import { Competence } from '../../../../lib/domain/models/Competence.js';
import { CORE_FRAMEWORK_NAME } from '../../../../lib/domain/constants.js';

const buildCompetence = function ({
  id = 'recCOMP1',
  name = 'Manger des fruits',
  index = '1.1',
  description = 'Teste les qualités de mangeage de fruits',
  areaId = 'area123',
  skillIds = [],
  thematicIds = [],
  tubes = [],
  origin = CORE_FRAMEWORK_NAME,
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
    tubes,
  });
};

export { buildCompetence };
