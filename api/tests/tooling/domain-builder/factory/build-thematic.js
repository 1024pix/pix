import { Thematic } from '../../../../lib/domain/models/Thematic.js';

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

export { buildThematic };
