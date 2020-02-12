const faker = require('faker');

const Competence = require('../../../../lib/domain/models/Competence');
const buildArea = require('./build-area');

module.exports = function buildCompetence({
  id = faker.random.uuid(),
  // attributes
  name = faker.random.word(),
  index = `${faker.random.number()}.${faker.random.number()}`,
  description = faker.lorem.sentence(),
  // relationships
  area = buildArea(),
  skills = [],
  origin = 'Pix',
} = {}) {

  return new Competence({
    id,
    // attributes
    name,
    index,
    description,
    origin,
    // relationships
    area,
    skills,
  });
};
