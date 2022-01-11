const Thematic = require('../../../../lib/domain/models/Thematic');

const buildThematic = function buildThematic({ id = 'recThem1', name = 'My Thematic', index = 0, tubeIds = [] } = {}) {
  return new Thematic({
    id,
    name,
    index,
    tubeIds,
  });
};

module.exports = buildThematic;
