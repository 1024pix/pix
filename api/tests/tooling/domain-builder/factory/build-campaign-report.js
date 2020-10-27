const CampaignReport = require('../../../../lib/domain/models/CampaignReport');
const faker = require('faker');

module.exports = function buildCampaignReport(
  {
    id = 1,
    participationsCount = faker.random.number(50),
    sharedParticipationsCount = faker.random.number({ max: participationsCount }),
    stages = [],
  } = {}) {
  return new CampaignReport({ id, participationsCount, sharedParticipationsCount, stages });
};
