const CampaignTypes = require('../../../../lib/domain/models/CampaignTypes');
const CampaignToStartParticipation = require('../../../../lib/domain/models/CampaignToStartParticipation');

module.exports = function buildCampaignToStartParticipation({
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
