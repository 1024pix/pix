import { Campaign } from '../../../../../../src/prescription/campaign/domain/models/Campaign.js';
import { CampaignTypes } from '../../../../../../src/prescription/shared/domain/constants.js';

function buildCampaign({
  id = 1,
  name = 'name',
  code = 'AZERTY123',
  title = 'title',
  idPixLabel = 'idPixLabel',
  externalIdHelpImageUrl = null,
  alternativeTextToExternalIdHelpImage = null,
  customLandingPageText = 'landing page text',
  archivedAt = null,
  archivedBy = null,
  type = CampaignTypes.ASSESSMENT,
  isForAbsoluteNovice = false,
  createdAt = new Date('2020-01-01'),
  creatorId = 2,
  ownerId = 3,
  organizationId = 4,
  targetProfileId = 5,
  customResultPageButtonText = null,
  customResultPageButtonUrl = null,
  customResultPageText = null,
  multipleSendings = false,
  assessmentMethod = 'SMART_RANDOM',
  participationCount = 0,
} = {}) {
  return new Campaign({
    id,
    name,
    code,
    organizationId,
    creatorId,
    createdAt,
    targetProfileId,
    idPixLabel,
    title,
    customLandingPageText,
    archivedAt,
    type,
    externalIdHelpImageUrl,
    alternativeTextToExternalIdHelpImage,
    isForAbsoluteNovice,
    customResultPageText,
    customResultPageButtonText,
    customResultPageButtonUrl,
    multipleSendings,
    assessmentMethod,
    ownerId,
    archivedBy,
    participationCount,
  });
}

buildCampaign.ofTypeAssessment = (input) => buildCampaign({ ...input, type: CampaignTypes.ASSESSMENT });
buildCampaign.ofTypeProfilesCollection = (input) =>
  buildCampaign({ ...input, type: CampaignTypes.PROFILES_COLLECTION });

export { buildCampaign };
