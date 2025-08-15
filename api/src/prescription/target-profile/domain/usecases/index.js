import { attachOrganizationsFromExistingTargetProfile } from './attach-organizations-from-existing-target-profile.js';
import { attachOrganizationsToTargetProfile } from './attach-organizations-to-target-profile.js';
import { attachTargetProfilesToOrganization } from './attach-target-profiles-to-organization.js';
import { copyTargetProfile } from './copy-target-profile.js';
import { createTargetProfile } from './create-target-profile.js';
import { detachOrganizationsFromTargetProfile } from './detach-organizations-from-target-profile.js';
import { findOrganizationTargetProfileSummariesForAdmin } from './find-organization-target-profile-summaries-for-admin.js';
import { findPaginatedFilteredOrganizationByTargetProfileId } from './find-paginated-filtered-target-profile-organizations.js';
import { findPaginatedFilteredTargetProfileSummariesForAdmin } from './find-paginated-filtered-target-profile-summaries-for-admin.js';
import { findSkillsByTargetProfileIds } from './find-skills-by-target-profile-ids.js';
import { getAvailableTargetProfilesForOrganization } from './get-available-target-profiles-for-organization.js';
import { getLearningContentByTargetProfile } from './get-learning-content-by-target-profile.js';
import { getLearningContentForTargetProfileSubmission } from './get-learning-content-for-target-profile-submission.js';
import { getTargetProfile } from './get-target-profile.js';
import { getTargetProfileContentAsJson } from './get-target-profile-content-as-json.js';
import { getTargetProfileForAdmin } from './get-target-profile-for-admin.js';
import { markTargetProfileAsSimplifiedAccess } from './mark-target-profile-as-simplified-access.js';
import { outdateTargetProfile } from './outdate-target-profile.js';
import { updateTargetProfile } from './update-target-profile.js';

const usecases = {
  attachOrganizationsFromExistingTargetProfile,
  attachOrganizationsToTargetProfile,
  attachTargetProfilesToOrganization,
  copyTargetProfile,
  createTargetProfile,
  detachOrganizationsFromTargetProfile,
  findOrganizationTargetProfileSummariesForAdmin,
  findPaginatedFilteredOrganizationByTargetProfileId,
  findPaginatedFilteredTargetProfileSummariesForAdmin,
  findSkillsByTargetProfileIds,
  getAvailableTargetProfilesForOrganization,
  getLearningContentByTargetProfile,
  getLearningContentForTargetProfileSubmission,
  getTargetProfileContentAsJson,
  getTargetProfileForAdmin,
  getTargetProfile,
  markTargetProfileAsSimplifiedAccess,
  outdateTargetProfile,
  updateTargetProfile,
};

export { usecases };
