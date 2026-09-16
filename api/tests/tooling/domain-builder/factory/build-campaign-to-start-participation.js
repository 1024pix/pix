import { CampaignToStartParticipation } from '../../../../src/prescription/campaign-participation/domain/models/CampaignToStartParticipation.js';
import { CampaignTypes } from '../../../../src/prescription/shared/domain/constants.ts';

export function buildCampaignToStartParticipation({
  id = 1,
  externalIdLabel = 'Un id pix label',
  externalIdType,
  archivedAt = null,
  deletedAt = null,
  type = CampaignTypes.ASSESSMENT,
  hasLearnersImportFeature = false,
  isManagingStudents = false,
  multipleSendings = false,
  assessmentMethod = 'SMART_RANDOM',
  skillCount = 1,
  organizationId,
} = {}) {
  return new CampaignToStartParticipation({
    id,
    externalIdLabel,
    externalIdType,
    archivedAt,
    deletedAt,
    type,
    hasLearnersImportFeature,
    isManagingStudents,
    multipleSendings,
    assessmentMethod,
    skillCount: type === CampaignTypes.ASSESSMENT ? skillCount : null,
    organizationId,
  });
}
