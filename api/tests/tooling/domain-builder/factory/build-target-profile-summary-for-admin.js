import { TargetProfileSummaryForAdmin } from '../../../../src/prescription/target-profile/domain/models/TargetProfileSummaryForAdmin.js';

const buildTargetProfileSummaryForAdmin = function ({
  id = 123,
  name = 'Profil cible super cool',
  category,
  outdated = false,
  createdAt,
  ownerOrganizationId,
  sharedOrganizationId,
} = {}) {
  return new TargetProfileSummaryForAdmin({
    id,
    name,
    outdated,
    category,
    createdAt,
    ownerOrganizationId,
    sharedOrganizationId,
  });
};

export { buildTargetProfileSummaryForAdmin };
