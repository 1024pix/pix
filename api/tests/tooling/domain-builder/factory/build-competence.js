const Competence = require('../../../../lib/domain/models/Competence');
const buildArea = require('./build-area');

// TODO dont forget to promote me later !
const buildCompetence = function ({
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

buildCompetence.noArea = function ({
  id = 'recCOMP1',
  name = 'Manger des fruits',
  index = '1.1',
  description = 'Teste les qualités de mangeage de fruits',
  areaId = 'area123',
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
    skillIds,
    thematicIds,
    tubes,
  });
};

module.exports = buildCompetence;
