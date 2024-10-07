import { TargetProfileSummaryForAdmin } from '../../../../src/prescription/target-profile/domain/models/TargetProfileSummaryForAdmin.js';

const buildTargetProfileSummaryForAdmin = function ({
  id = 123,
  name = 'Profil cible super cool',
  outdated = false,
  createdAt,
  ownerOrganizationId,
  sharedOrganizationId,
} = {}) {
  return new TargetProfileSummaryForAdmin({
    id,
    name,
    outdated,
    createdAt,
    ownerOrganizationId,
    sharedOrganizationId,
  });
};

export { buildTargetProfileSummaryForAdmin };
