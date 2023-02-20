import CampaignTypes from '../../../../lib/domain/models/CampaignTypes';
import CampaignToStartParticipation from '../../../../lib/domain/models/CampaignToStartParticipation';

export default function buildCampaignToStartParticipation({
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
}
