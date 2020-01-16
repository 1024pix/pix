const faker = require('faker');
const Area = require('../../../../lib/domain/models/Area');

module.exports = function buildArea({
  id = faker.random.uuid(),
  code = faker.random.number(),
  title = faker.lorem.words(),
  competences = [],
  color = faker.lorem.word(),
  // optional
  name
} = {}) {
  name = name || `${code}. ${title}`;
  return new Area({
    id,
    name,
    code,
    title,
    competences,
    color,
  });
};
