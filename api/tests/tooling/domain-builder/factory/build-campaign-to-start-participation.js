import { CampaignTypes } from '../../../../src/prescription/shared/domain/constants.js';
import { CampaignToStartParticipation } from '../../../../lib/domain/models/CampaignToStartParticipation.js';

const buildCampaignToStartParticipation = function ({
  id = 1,
  idPixLabel = 'Un id pix label',
  archivedAt = null,
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
    type,
    isRestricted,
    multipleSendings,
    assessmentMethod,
    skillCount: type === CampaignTypes.ASSESSMENT ? skillCount : null,
    organizationId,
  });
};

export { buildCampaignToStartParticipation };
