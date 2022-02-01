const Campaign = require('../../../../lib/domain/models/Campaign');
const CampaignManagement = require('../../../../lib/domain/read-models/CampaignManagement');

module.exports = function buildCampaignManagement({
  id = 1,
  name = 'Un nom de campagne',
  code = 'AZERTY123',
  createdAt = new Date(),
  archivedAt = null,
  type = Campaign.types.ASSESSMENT,
  creatorId = 2,
  creatorFirstName = 'Un prénom',
  creatorLastName = 'Un nom',
} = {}) {
  return new CampaignManagement({
    id,
    name,
    code,
    createdAt,
    archivedAt,
    type,
    creatorId,
    creatorFirstName,
    creatorLastName,
  });
};
