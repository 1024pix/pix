const faker = require('faker');
const Tag = require('../../../../lib/domain/models/Tag');

function buildTag({
  id = faker.random.number(),
  name = faker.random.words(),
} = {}) {
  return new Tag({
    id,
    name,
  });
}

module.exports = buildTag;
