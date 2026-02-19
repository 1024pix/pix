import { TargetProfileSummaryForAdmin } from '../../../../src/prescription/target-profile/domain/models/TargetProfileSummaryForAdmin.js';

const buildTargetProfileSummaryForAdmin = function ({
  id = 123,
  internalName = 'Profil cible super cool interne',
  category,
  outdated = false,
  createdAt,
  sharedOrganizationId,
  isPartOfCombinedCourse = undefined,
} = {}) {
  const targetProfileSummaryForAdmin = new TargetProfileSummaryForAdmin({
    id,
    internalName,
    outdated,
    category,
    createdAt,
    sharedOrganizationId,
  });
  if (isPartOfCombinedCourse !== undefined) {
    targetProfileSummaryForAdmin.isPartOfCombinedCourse = isPartOfCombinedCourse;
  }
  return targetProfileSummaryForAdmin;
};

export { buildTargetProfileSummaryForAdmin };
