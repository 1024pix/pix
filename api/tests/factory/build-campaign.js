const Campaign = require('../../lib/domain/models/Campaign');
const faker = require('faker');

module.exports = function buildCampaign(
  {
    id = 1,
    name = faker.company.companyName(),
    code = 'AZERTY123',
    createdAt = faker.date.recent(),
    creatorId = faker.random.number(2),
    organizationId = faker.random.number(2),
    targetProfileId = faker.random.number(2),
  } = {}) {
  return new Campaign({ id, name, code, createdAt, creatorId, organizationId, targetProfileId });
};
