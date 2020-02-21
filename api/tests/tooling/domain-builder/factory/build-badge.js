const Badge = require('../../../../lib/domain/models/Badge');
const faker = require('faker');

module.exports = function buildBadge(
  {
    id = 1,
    altMessage = faker.lorem.sentence(),
    imageUrl = '/img/banana',
    message = faker.lorem.sentence(),
    targetProfileId = faker.random.number(2),
  } = {}) {
  return new Badge({
    id,
    altMessage,
    imageUrl,
    message,
    targetProfileId,
  });
};
