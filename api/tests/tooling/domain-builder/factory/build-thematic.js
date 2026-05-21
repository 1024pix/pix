import { Thematic } from '../../../../src/shared/domain/models/Thematic.js';

const buildThematic = function buildThematic({
  id = 'recThem1',
  name = 'My Thematic',
  index = 0,
  competenceId = 'recComp1',
  tubeIds = [],
  tubes = [],
} = {}) {
  return new Thematic({
    id,
    name,
    index,
    competenceId,
    tubeIds,
    tubes,
  });
};

export { buildThematic };
