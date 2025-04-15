import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as centerRepository from '../../../certification/enrolment/infrastructure/repositories/center-repository.js';
import * as learnersApi from '../../../prescription/learner-management/application/api/learners-api.js';
import * as schoolRepository from '../../../school/infrastructure/repositories/school-repository.js';
import * as codeGenerator from '../../../shared/domain/services/code-generator.js';
import { adminMemberRepository } from '../../../shared/infrastructure/repositories/admin-member.repository.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as certificationCenterRepository from '../../infrastructure/repositories/certification-center.repository.js';
import { certificationCenterApiRepository } from '../../infrastructure/repositories/certification-center-api.repository.js';
import * as certificationCenterForAdminRepository from '../../infrastructure/repositories/certification-center-for-admin.repository.js';
import * as complementaryCertificationHabilitationRepository from '../../infrastructure/repositories/complementary-certification-habilitation.repository.js';
import * as dataProtectionOfficerRepository from '../../infrastructure/repositories/data-protection-officer.repository.js';
import * as organizationFeatureRepository from '../../infrastructure/repositories/organization-feature-repository.js';
import { organizationForAdminRepository } from '../../infrastructure/repositories/organization-for-admin.repository.js';
import * as organizationTagRepository from '../../infrastructure/repositories/organization-tag.repository.js';
import { tagRepository } from '../../infrastructure/repositories/tag.repository.js';
import * as organizationCreationValidator from '../validators/organization-creation-validator.js';

const path = dirname(fileURLToPath(import.meta.url));

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
 * @typedef {import ('../../infrastructure/repositories/organization-for-admin.repository.js')} OrganizationForAdminRepository
 * @typedef {import ('../../infrastructure/repositories/tag.repository.js')} TagRepository
 * @typedef {import ('../../../school/infrastructure/repositories/school-repository.js')} SchoolRepository
 * @typedef {import ('../validators/organization-creation-validator.js')} OrganizationCreationValidator
 */

const repositories = {
  adminMemberRepository,
  organizationCreationValidator,
  codeGenerator,
  centerRepository,
  certificationCenterRepository,
  certificationCenterForAdminRepository,
  dataProtectionOfficerRepository,
  certificationCenterApiRepository,
  complementaryCertificationHabilitationRepository,
  organizationForAdminRepository,
  organizationFeatureRepository,
  schoolRepository,
  learnersApi,
  organizationTagRepository,
  tagRepository,
};

const dependencies = Object.assign({}, repositories);

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({ path: join(path, './'), ignoredFileNames: ['index.js'] })),
};

/**
 * @typedef OrganizationalEntitiesUsecases
 * @property {addOrganizationFeatureInBatch} addOrganizationFeatureInBatch
 * @property {attachChildOrganizationToOrganization} attachChildOrganizationToOrganization
 * @property {createCertificationCenter} createCertificationCenter
 * @property {createTag} createTag
 * @property {findPaginatedFilteredCertificationCenters} findPaginatedFilteredCertificationCenters
 * @property {getOrganizationDetails} getOrganizationDetails
 * @property {updateOrganizationsInBatch} updateOrganizationsInBatch
 * @property {updateOrganizationInformation} updateOrganizationInformation
 */

/**
 * @type {OrganizationalEntitiesUsecases}
 */
const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { repositories, usecases };
