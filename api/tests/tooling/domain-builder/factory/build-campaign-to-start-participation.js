const Campaign = require('../../../../lib/domain/models/Campaign');
const CampaignToStartParticipation = require('../../../../lib/domain/models/CampaignToStartParticipation');

module.exports = function buildCampaignToStartParticipation({
  id = 1,
  idPixLabel = 'Un id pix label',
  archivedAt = null,
  type = Campaign.types.ASSESSMENT,
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
    skillCount: type === Campaign.types.ASSESSMENT ? skillCount : null,
    organizationId,
  });
};
