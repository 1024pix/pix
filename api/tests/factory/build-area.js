const faker = require('faker');
const Area = require('../../lib/domain/models/Area');

module.exports = function buildArea({
  id = faker.random.uuid(),
  name = '1. Information et données',
  code = '1',
  title = 'Information et données',
  competences = [],
} = {}) {
  return new Area({
    id,
    name,
    code,
    title,
    competences,
  });
};
