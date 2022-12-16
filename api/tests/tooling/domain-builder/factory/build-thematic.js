const Thematic = require('../../../../lib/domain/models/Thematic');

const buildThematic = function buildThematic({
  id = 'recThem1',
  name = 'My Thematic',
  index = 0,
  competenceId = 'recComp1',
  tubeIds = [],
} = {}) {
  return new Thematic({
    id,
    name,
    index,
    competenceId,
    tubeIds,
  });
};

module.exports = buildThematic;
