import * as centerRepository from '../../../certification/enrolment/infrastructure/repositories/center-repository.js';
import * as learnersApi from '../../../prescription/learner-management/application/api/learners-api.js';
import * as schoolRepository from '../../../school/infrastructure/repositories/school-repository.js';
import * as accessCodeGenerator from '../../../shared/domain/services/access-code-generator.js';
import { adminMemberRepository } from '../../../shared/infrastructure/repositories/admin-member.repository.js';
import * as countryRepository from '../../../shared/infrastructure/repositories/country-repository.js';
import * as featureRepository from '../../../shared/infrastructure/repositories/feature-repository.js';
import * as organizationRepository from '../../../shared/infrastructure/repositories/organization-repository.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import * as administrationTeamRepository from '../../infrastructure/repositories/administration-team-repository.js';
import * as certificationCenterRepository from '../../infrastructure/repositories/certification-center.repository.js';
import { certificationCenterApiRepository } from '../../infrastructure/repositories/certification-center-api.repository.js';
import * as certificationCenterForAdminRepository from '../../infrastructure/repositories/certification-center-for-admin.repository.js';
import * as complementaryCertificationHabilitationRepository from '../../infrastructure/repositories/complementary-certification-habilitation.repository.js';
import * as dataProtectionOfficerRepository from '../../infrastructure/repositories/data-protection-officer.repository.js';
import { repositories as organizationalEntitiesRepositories } from '../../infrastructure/repositories/index.js';
import * as networkRepository from '../../infrastructure/repositories/network.repository.js';
import * as organizationFeatureRepository from '../../infrastructure/repositories/organization-feature-repository.js';
import * as organizationLearnerRepository from '../../infrastructure/repositories/organization-learner.repository.js';
import * as organizationLearnerTypeRepository from '../../infrastructure/repositories/organization-learner-type-repository.js';
import * as organizationPlacesLotRepository from '../../infrastructure/repositories/organization-places-lot.repository.js';
import * as organizationTagRepository from '../../infrastructure/repositories/organization-tag.repository.js';
import { tagRepository } from '../../infrastructure/repositories/tag.repository.js';
import * as targetProfileShareRepository from '../../infrastructure/repositories/target-profile-share-repository.js';
import * as organizationVerificationService from '../services/organization-verification.service.js';
import * as organizationCreationValidator from '../validators/organization-creation-validator.js';
import * as organizationValidator from '../validators/organization-with-tags-and-target-profiles.js';

/**
 * @typedef {import ('../../../prescription/learner-management/application/api/learners-api.js')} learnersApi
 * @typedef {import ('../../../shared/infrastructure/repositories/admin-member.repository.js')} AdminMemberRepository
 * @typedef {import ('../../infrastructure/repositories/certification-center-api.repository.js')} certificationCenterApiRepository
 * @typedef {import ('../../infrastructure/repositories/certification-center.repository.js')} CertificationCenterRepository
 * @typedef {import ('../../../certification/enrolment/infrastructure/repositories/center-repository.js')} CenterRepository
 * @typedef {import ('../../infrastructure/repositories/certification-center-for-admin-repository.js')} CertificationCenterForAdminRepository
 * @typedef {import ('../../infrastructure/repositories/complementary-certification-habilitation-repository.js')} ComplementaryCertificationHabilitationRepository
 * @typedef {import ('../../infrastructure/repositories/data-protection-officer-repository.js')} DataProtectionOfficerRepository
 * @typedef {import ('../../infrastructure/repositories/organization-feature-repository.js')} OrganizationFeatureRepository
 * @typedef {import ('../../infrastructure/repositories/organization-places-lot.repository.js')} OrganizationPlacesLotRepository
 * @typedef {import ('../../infrastructure/repositories/organization-learner.repository.js')} OrganizationLearnerRepository
 * @typedef {import ('../../infrastructure/repositories/organization-learner-type-repository.js')} OrganizationLearnerTypeRepository
 * @typedef {import ('../../infrastructure/repositories/organization-for-admin.repository.js')} OrganizationForAdminRepository
 * @typedef {import ('../../infrastructure/repositories/tag.repository.js')} TagRepository
 * @typedef {import ('../../infrastructure/repositories/network.repository.js')} NetworkRepository
 * @typedef {import ('../../infrastructure/repositories/target-profile-share-repository.js')} TargetProfileShareRepository
 * @typedef {import ('../../../shared/infrastructure/repositories/organization-repository.js')} OrganizationRepository
 * @typedef {import ('../../../school/infrastructure/repositories/school-repository.js')} SchoolRepository
 * @typedef {import ('../validators/organization-creation-validator.js')} OrganizationCreationValidator
 * @typedef {import ('../../../shared/infrastructure/repositories/country-repository.js')} CountryRepository
 * @typedef {import ('../services/organization-verification.service.js')} OrganizationVerificationService
 */

const dependenciesToInject = {
  administrationTeamRepository,
  adminMemberRepository,
  organizationValidator,
  organizationCreationValidator,
  accessCodeGenerator,
  centerRepository,
  certificationCenterRepository,
  certificationCenterForAdminRepository,
  countryRepository,
  featureRepository,
  dataProtectionOfficerRepository,
  certificationCenterApiRepository,
  complementaryCertificationHabilitationRepository,
  networkRepository,
  organizationForAdminRepository: organizationalEntitiesRepositories.organizationForAdminRepository,
  organizationFeatureRepository,
  organizationLearnerRepository,
  organizationLearnerTypeRepository,
  organizationPlacesLotRepository,
  schoolRepository,
  learnersApi,
  organizationRepository,
  organizationTagRepository,
  tagRepository,
  targetProfileShareRepository,
  organizationVerificationService,
};

const dependencies = Object.assign({}, dependenciesToInject);

import { addOrganizationFeatureInBatch } from './add-organization-feature-in-batch.usecase.js';
import { addTagsToOrganizations } from './add-tags-to-organizations.usecase.js';
import { archiveCertificationCenter } from './archive-certification-center.usecase.js';
import { archiveCertificationCentersInBatch } from './archive-certification-centers-in-batch.usecase.js';
import { archiveOrganization } from './archive-organization.usecase.js';
import { archiveOrganizationsInBatch } from './archive-organizations-in-batch.usecase.js';
import { attachCertificationCenterToOrganization } from './attach-certification-center-to-organization.usecase.js';
import { attachChildOrganizationToOrganizationUsecase } from './attach-child-organization-to-organization.usecase.js';
import { createCertificationCenter } from './create-certification-center.usecase.js';
import { createNetwork } from './create-network.usecase.js';
import { createOrganization } from './create-organization.js';
import { createOrganizationsWithTagsAndTargetProfiles } from './create-organizations-with-tags-and-target-profiles.usecase.js';
import { createTag } from './create-tag.js';
import { detachCertificationCenterFromOrganization } from './detach-certification-center-from-organization.usecase.js';
import { detachParentOrganizationFromOrganization } from './detach-parent-organization-from-organization.usecase.js';
import { findAllAdministrationTeams } from './find-all-administration-teams.usecase.js';
import { findAllOrganizationLearnerTypes } from './find-all-organization-learner-types.refactor.js';
import { findAllTags } from './find-all-tags.usecase.js';
import { findAttachedCertificationCenterForAdmin } from './find-attached-certification-center-for-admin.usecase.js';
import { findAttachedOrganizationsForAdmin } from './find-attached-organizations-for-admin.usecase.js';
import { findChildrenOrganizations } from './find-children-organizations.usecase.js';
import { findOrganizationFeatures } from './find-organization-features.js';
import { findPaginatedFilteredCertificationCenters } from './find-paginated-filtered-certification-centers.usecase.js';
import { findPaginatedFilteredNetworks } from './find-paginated-filtered-networks.usecase.js';
import { findPaginatedFilteredOrganizations } from './find-paginated-filtered-organizations.usecase.js';
import { getCenterForAdmin } from './get-center-for-admin.usecase.js';
import { getNetworkDetails } from './get-network-details.usecase.js';
import { getOrganizationById } from './get-organization-by-id.js';
import { getOrganizationDetails } from './get-organization-details.usecase.js';
import { getOrganizationPlacesStatistics } from './get-organization-places-statistics.usecase.js';
import { getOrganizationStatistics } from './get-organization-statistics.usecase.js';
import { getRecentlyUsedTags } from './get-recently-used-tags.usecase.js';
import { updateCertificationCenter } from './update-certification-center.usecase.js';
import { updateCertificationCenterDataProtectionOfficerInformation } from './update-certification-center-data-protection-officer-information.usecase.js';
import { updateNetwork } from './update-network.usecase.js';
import { updateOrganizationInformation } from './update-organization-information.usecase.js';
import { updateOrganizationsInBatch } from './update-organizations-in-batch.usecase.js';

const usecasesWithoutInjectedDependencies = {
  addOrganizationFeatureInBatch,
  addTagsToOrganizations,
  archiveCertificationCenter,
  archiveCertificationCentersInBatch,
  archiveOrganization,
  archiveOrganizationsInBatch,
  attachCertificationCenterToOrganization,
  attachChildOrganizationToOrganization: attachChildOrganizationToOrganizationUsecase,
  createCertificationCenter,
  createNetwork,
  createOrganization,
  createOrganizationsWithTagsAndTargetProfiles,
  createTag,
  detachCertificationCenterFromOrganization,
  detachParentOrganizationFromOrganization,
  findPaginatedFilteredNetworks,
  findAllTags,
  findAttachedCertificationCenterForAdmin,
  findAttachedOrganizationsForAdmin,
  findChildrenOrganizations,
  findOrganizationFeatures,
  findPaginatedFilteredCertificationCenters,
  findPaginatedFilteredOrganizations,
  findAllAdministrationTeams,
  findAllOrganizationLearnerTypes,
  getCenterForAdmin,
  getNetworkDetails,
  getOrganizationById,
  getOrganizationDetails,
  getOrganizationPlacesStatistics,
  getOrganizationStatistics,
  getRecentlyUsedTags,
  updateCertificationCenterDataProtectionOfficerInformation,
  updateCertificationCenter,
  updateNetwork,
  updateOrganizationInformation,
  updateOrganizationsInBatch,
};
/**
 * @typedef OrganizationalEntitiesUsecases
 * @property {attachChildOrganizationToOrganizationUsecase} attachChildOrganizationToOrganization
 * @property {attachCertificationCenterToOrganization} attachCertificationCenterToOrganization
 * @property {addOrganizationFeatureInBatch} addOrganizationFeatureInBatch
 * @property {createCertificationCenter} createCertificationCenter
 * @property {createTag} createTag
 * @property {detachCertificationCenterFromOrganization} detachCertificationCenterFromOrganization
 * @property {detachParentOrganizationFromOrganization} detachParentOrganizationFromOrganization
 * @property {findPaginatedFilteredCertificationCenters} findPaginatedFilteredCertificationCenters
 * @property {findAttachedOrganizationsForAdmin} findAttachedOrganizationsForAdmin
 * @property {findAttachedCertificationCenterForAdmin} findAttachedCertificationCenterForAdmin
 * @property {getOrganizationDetails} getOrganizationDetails
 * @property {getOrganizationStatistics} getOrganizationStatistics
 * @property {getNetworkDetails} getNetworkDetails
 * @property {updateOrganizationsInBatch} updateOrganizationsInBatch
 * @property {updateOrganizationInformation} updateOrganizationInformation
 * @property {archiveOrganizationsInBatch} archiveOrganizationsInBatch
 * @property {findPaginatedFilteredNetworks} findPaginatedFilteredNetworks
 */

/**
 * @type {OrganizationalEntitiesUsecases}
 */
const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies, boundedContext);

export { usecases };
