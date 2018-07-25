const Campaign = require('../../lib/domain/models/Campaign');
const faker = require('faker');

module.exports = function buildCampaign(
  {
    id = 1,
    name = faker.company.companyName(),
    code = 'AZERTY123',
    creatorId = faker.random.number(2),
    organizationId = faker.random.number(2),
  } = {}) {
  return new Campaign({ id, name, code, creatorId, organizationId });
};
