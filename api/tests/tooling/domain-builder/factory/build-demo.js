const faker = require('faker');
const Demo = require('../../../../lib/domain/models/Demo');

module.exports = function buildDemo({
  id = faker.random.number(),

  // attributes
  description = faker.lorem.sentence(),
  imageUrl = faker.internet.url(),
  name = faker.lorem.word(),
  type = 'DEMO',

  // relationships
  challenges = [],
  competences = [],
} = {}) {
  return new Demo({
    id,
    // attributes
    description,
    imageUrl,
    name,
    type,
    // relations
    challenges,
    competences,
  });
};
