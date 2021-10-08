const Competence = require('../../../../lib/domain/models/Competence');
const buildArea = require('./build-area');

module.exports = function buildCompetence({
  id = 'recCOMP1',
  name = 'Manger des fruits',
  index = '1.1',
  description = 'Teste les qualités de mangeage de fruits',
  area = buildArea(),
  skillIds = [],
  origin = 'Pix',
} = {}) {
  return new Competence({
    id,
    name,
    index,
    description,
    origin,
    area,
    skillIds,
  });
};
