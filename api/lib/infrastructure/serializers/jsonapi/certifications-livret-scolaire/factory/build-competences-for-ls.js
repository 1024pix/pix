const Competence = require('../../../../../../lib/infrastructure/serializers/jsonapi/certifications-livret-scolaire/response-objects/Competence');
const { buildAreaForLS } = require('../../../../../../lib/infrastructure/serializers/jsonapi/certifications-livret-scolaire/factory/build-area-for-ls');

module.exports = function buildCompetenceForLS({
  id,
  name,
  area = buildAreaForLS(),
} = {}) {

  return new Competence({
    id,
    name,
    area,
  });
};
