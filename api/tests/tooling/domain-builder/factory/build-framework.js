const buildArea = require('./build-area');
const Framework = require('../../../../lib/domain/models/Framework');

module.exports = function buildFramework({ id = 'recFramework123', name = 'Mon super référentiel', areas } = {}) {
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
