import CampaignTypes from '../../../../lib/domain/models/CampaignTypes';
import CampaignManagement from '../../../../lib/domain/read-models/CampaignManagement';

export default function buildCampaignManagement({
  id = 1,
  name = 'Un nom de campagne',
  code = 'AZERTY123',
  createdAt = new Date(),
  archivedAt = null,
  type = CampaignTypes.ASSESSMENT,
  creatorId = 2,
  creatorFirstName = 'Un prénom',
  creatorLastName = 'Un nom',
  ownerId = 3,
  ownerFirstName = 'Alain',
  ownerLastName = 'Provist',
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
    ownerId,
    ownerFirstName,
    ownerLastName,
  });
}
