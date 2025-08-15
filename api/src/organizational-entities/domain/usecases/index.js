import { addOrganizationFeatureInBatch } from './add-organization-feature-in-batch.js';
import { addTagsToOrganizations } from './add-tags-to-organizations.usecase.js';
import { archiveCertificationCenter } from './archive-certification-center.usecase.js';
import { archiveCertificationCentersInBatch } from './archive-certification-centers-in-batch.usecase.js';
import { archiveOrganization } from './archive-organization.usecase.js';
import { archiveOrganizationsInBatch } from './archive-organizations-in-batch.usecase.js';
import { attachChildOrganizationToOrganization } from './attach-child-organization-to-organization.js';
import { createCertificationCenter } from './create-certification-center.usecase.js';
import { createOrganization } from './create-organization.js';
import { createOrganizationsWithTagsAndTargetProfiles } from './create-organizations-with-tags-and-target-profiles.usecase.js';
import { createTag } from './create-tag.js';
import { findAllTags } from './find-all-tags.usecase.js';
import { findChildrenOrganizations } from './find-children-organizations.usecase.js';
import { findOrganizationFeatures } from './find-organization-features.js';
import { findPaginatedFilteredCertificationCenters } from './find-paginated-filtered-certification-centers.usecase.js';
import { findPaginatedFilteredOrganizations } from './find-paginated-filtered-organizations.usecase.js';
import { getCenterForAdmin } from './get-center-for-admin.usecase.js';
import { getOrganizationById } from './get-organization-by-id.js';
import { getOrganizationDetails } from './get-organization-details.usecase.js';
import { getRecentlyUsedTags } from './get-recently-used-tags.usecase.js';
import { updateCertificationCenter } from './update-certification-center.usecase.js';
import { updateCertificationCenterDataProtectionOfficerInformation } from './update-certification-center-data-protection-officer-information.usecase.js';
import { updateOrganizationInformation } from './update-organization-information.usecase.js';
import { updateOrganizationsInBatch } from './update-organizations-in-batch.usecase.js';

const usecases = {
  addOrganizationFeatureInBatch,
  addTagsToOrganizations,
  archiveCertificationCenter,
  archiveCertificationCentersInBatch,
  archiveOrganization,
  archiveOrganizationsInBatch,
  attachChildOrganizationToOrganization,
  createCertificationCenter,
  createOrganization,
  createOrganizationsWithTagsAndTargetProfiles,
  createTag,
  findAllTags,
  findChildrenOrganizations,
  findOrganizationFeatures,
  findPaginatedFilteredCertificationCenters,
  findPaginatedFilteredOrganizations,
  getCenterForAdmin,
  getOrganizationById,
  getOrganizationDetails,
  getRecentlyUsedTags,
  updateCertificationCenterDataProtectionOfficerInformation,
  updateCertificationCenter,
  updateOrganizationInformation,
  updateOrganizationsInBatch,
};

export { usecases };
