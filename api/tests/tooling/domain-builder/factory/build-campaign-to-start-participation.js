import { CampaignToStartParticipation } from '../../../../src/prescription/campaign-participation/domain/models/CampaignToStartParticipation.js';
import { CampaignTypes } from '../../../../src/prescription/shared/domain/constants.js';

const buildCampaignToStartParticipation = function ({
  id = 1,
  idPixLabel = 'Un id pix label',
  archivedAt = null,
  deletedAt = null,
  type = CampaignTypes.ASSESSMENT,
  isRestricted = false,
  multipleSendings = false,
  assessmentMethod = 'SMART_RANDOM',
  skillCount = 1,
  organizationId,
} = {}) {
  return new CampaignToStartParticipation({
    id,
    idPixLabel,
    archivedAt,
    deletedAt,
    type,
    isRestricted,
    multipleSendings,
    assessmentMethod,
    skillCount: type === CampaignTypes.ASSESSMENT ? skillCount : null,
    organizationId,
  });
};

export { buildCampaignToStartParticipation };
