import { TargetProfileSummaryForAdmin } from '../../../../lib/domain/models/TargetProfileSummaryForAdmin.js';

const buildTargetProfileSummaryForAdmin = function ({
  id = 123,
  name = 'Profil cible super cool',
  outdated = false,
  isPublic,
  createdAt,
  ownerOrganizationId,
  sharedOrganizationId,
} = {}) {
  return new TargetProfileSummaryForAdmin({
    id,
    name,
    outdated,
    isPublic,
    createdAt,
    ownerOrganizationId,
    sharedOrganizationId,
  });
};

export { buildTargetProfileSummaryForAdmin };
