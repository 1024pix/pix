import { Framework } from '../../../../src/shared/domain/models/Framework.js';
import { buildArea } from './build-area.js';

const buildFramework = function ({ id = 'recFramework123', name = 'Mon super référentiel', areas } = {}) {
  areas = areas || [buildArea({ frameworkId: id })];
  const framework = new Framework({
    id,
    name,
    areas,
  });

  areas.forEach((area) => {
    area.frameworkId = id;
  });
  return framework;
};

export { buildFramework };
