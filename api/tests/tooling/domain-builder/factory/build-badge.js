const Badge = require('../../../../lib/domain/models/Badge');
const faker = require('faker');

module.exports = function buildBadge(
  {
    id = 1,
    imageUrl = '/img/banana',
    message = faker.lorem.sentence(),
    targetProfileId = faker.random.number(2),
  } = {}) {
  return new Badge({
    id,
    imageUrl,
    message,
    targetProfileId,
  });
};
