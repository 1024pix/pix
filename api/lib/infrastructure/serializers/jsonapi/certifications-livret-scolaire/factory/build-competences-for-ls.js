const faker = require('faker');

const Competence = require('../../../../../../lib/infrastructure/serializers/jsonapi/certifications-livret-scolaire/response-objects/Competence');
const { buildAreaForLS } = require('../../../../../../lib/infrastructure/serializers/jsonapi/certifications-livret-scolaire/factory/build-area-for-ls');

module.exports = function buildCompetenceForLS({
  id = faker.random.uuid(),
  // attributes
  name = faker.random.word(),
  // relationships
  area = buildAreaForLS(),
} = {}) {

  return new Competence({
    id,
    // attributes
    name,
    // relationships
    area,
  });
};
