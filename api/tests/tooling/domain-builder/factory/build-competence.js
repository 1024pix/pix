const Competence = require('../../../../lib/domain/models/Competence');
const buildArea = require('./build-area');

module.exports = function buildCompetence({
  id = 'recCOMP1',
  name = 'Manger des fruits',
  index = '1.1',
  description = 'Teste les qualités de mangeage de fruits',
  areaId = 'area123',
  area = buildArea(),
  skillIds = [],
  thematicIds = [],
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
    area,
    skillIds,
    thematicIds,
    tubes,
  });
};
