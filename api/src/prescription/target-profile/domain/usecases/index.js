import * as organizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import * as learningContentConversionService from '../../../shared/domain/services/learning-content-conversion-service.js';
import * as learningContentRepository from '../../../shared/infrastructure/repositories/learning-content-repository.js';
import * as targetProfileRepository from '../../../target-profile/infrastructure/repositories/target-profile-repository.js';
import * as organizationsToAttachToTargetProfileRepository from '../../infrastructure/repositories/organizations-to-attach-to-target-profile-repository.js';
import * as targetProfileAdministrationRepository from '../../infrastructure/repositories/target-profile-administration-repository.js';
import * as targetProfileBondRepository from '../../infrastructure/repositories/target-profile-bond-repository.js';
import * as targetProfileForSpecifierRepository from '../../infrastructure/repositories/target-profile-for-specifier-repository.js';
import * as targetProfileForUpdateRepository from '../../infrastructure/repositories/target-profile-for-update-repository.js';
import * as targetProfileSummaryForAdminRepository from '../../infrastructure/repositories/target-profile-summary-for-admin-repository.js';

/** @typedef {typeof dependencies} Dependencies */

const dependencies = {
  learningContentConversionService,
  learningContentRepository,
  organizationRepository,
  organizationsToAttachToTargetProfileRepository,
  targetProfileAdministrationRepository,
  targetProfileBondRepository,
  targetProfileForSpecifierRepository,
  targetProfileForUpdateRepository,
  targetProfileRepository,
  targetProfileSummaryForAdminRepository,
};

import { attachOrganizationsFromExistingTargetProfile } from './attach-organizations-from-existing-target-profile.js';
import { attachOrganizationsToTargetProfile } from './attach-organizations-to-target-profile.js';
import { attachTargetProfilesToOrganization } from './attach-target-profiles-to-organization.js';
import { checkTargetProfileBelongsToOrganization } from './check-target-profile-belongs-to-organization.js';
import { copyTargetProfile } from './copy-target-profile.js';
import { createTargetProfile } from './create-target-profile.js';
import { detachOrganizationsFromTargetProfile } from './detach-organizations-from-target-profile.js';
import { findLearningContentsByOrganizationId } from './find-learning-contents-by-organization-id.js';
import { findOrganizationTargetProfileSummariesForAdmin } from './find-organization-target-profile-summaries-for-admin.js';
import { findPaginatedFilteredTargetProfileSummariesForAdmin } from './find-paginated-filtered-target-profile-summaries-for-admin.js';
import { findSkillsByTargetProfileIds } from './find-skills-by-target-profile-ids.js';
import { getAvailableTargetProfilesForOrganization } from './get-available-target-profiles-for-organization.js';
import { getLearningContentByTargetProfile } from './get-learning-content-by-target-profile.js';
import { getTargetProfile } from './get-target-profile.js';
import { getTargetProfileContentAsJson } from './get-target-profile-content-as-json.js';
import { getTargetProfileForAdmin } from './get-target-profile-for-admin.js';
import { getTargetProfileOverview } from './get-target-profile-overview.js';
import { getTargetProfiles } from './get-target-profiles.js';
import { markTargetProfileAsSimplifiedAccess } from './mark-target-profile-as-simplified-access.js';
import { outdateTargetProfile } from './outdate-target-profile.js';
import { updateTargetProfile } from './update-target-profile.js';

const usecasesWithoutInjectedDependencies = {
  attachOrganizationsFromExistingTargetProfile,
  attachOrganizationsToTargetProfile,
  attachTargetProfilesToOrganization,
  checkTargetProfileBelongsToOrganization,
  copyTargetProfile,
  createTargetProfile,
  detachOrganizationsFromTargetProfile,
  findLearningContentsByOrganizationId,
  findOrganizationTargetProfileSummariesForAdmin,
  findPaginatedFilteredTargetProfileSummariesForAdmin,
  findSkillsByTargetProfileIds,
  getAvailableTargetProfilesForOrganization,
  getLearningContentByTargetProfile,
  getTargetProfileContentAsJson,
  getTargetProfileForAdmin,
  getTargetProfile,
  getTargetProfiles,
  getTargetProfileOverview,
  markTargetProfileAsSimplifiedAccess,
  outdateTargetProfile,
  updateTargetProfile,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
