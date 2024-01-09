import { CampaignTypes } from '../../../../src/prescription/shared/domain/constants.js';
import { CampaignManagement } from '../../../../src/prescription/campaign/domain/models/CampaignManagement.js';

const buildCampaignManagement = function ({
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
  targetProfileId = 1,
  targetProfileName = 'Juste un profil cible',
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
    targetProfileId,
    targetProfileName,
  });
};

export { buildCampaignManagement };
