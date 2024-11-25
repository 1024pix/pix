import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as organizationTagRepository from '../../../../lib/infrastructure/repositories/organization-tag-repository.js';
import * as schoolRepository from '../../../school/infrastructure/repositories/school-repository.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as certificationCenterRepository from '../../infrastructure/repositories/certification-center.repository.js';
import * as certificationCenterForAdminRepository from '../../infrastructure/repositories/certification-center-for-admin.repository.js';
import * as complementaryCertificationHabilitationRepository from '../../infrastructure/repositories/complementary-certification-habilitation.repository.js';
import * as dataProtectionOfficerRepository from '../../infrastructure/repositories/data-protection-officer.repository.js';
import * as organizationFeatureRepository from '../../infrastructure/repositories/organization-feature-repository.js';
import { organizationForAdminRepository } from '../../infrastructure/repositories/organization-for-admin.repository.js';
import { tagRepository } from '../../infrastructure/repositories/tag.repository.js';

const path = dirname(fileURLToPath(import.meta.url));

/**
 * @typedef {import ('../../infrastructure/repositories/certification-center.repository.js')} CertificationCenterRepository
 * @typedef {import ('../../infrastructure/repositories/certification-center-for-admin-repository.js')} CertificationCenterForAdminRepository
 * @typedef {import ('../../infrastructure/repositories/complementary-certification-habilitation-repository.js')} ComplementaryCertificationHabilitationRepository
 * @typedef {import ('../../infrastructure/repositories/data-protection-officer-repository.js')} DataProtectionOfficerRepository
 * @typedef {import ('../../infrastructure/repositories/organization-feature-repository.js')} OrganizationFeatureRepository
 * @typedef {import ('../../infrastructure/repositories/organization-for-admin.repository.js')} OrganizationForAdminRepository
 * @typedef {import ('../../infrastructure/repositories/tag.repository.js')} TagRepository
 * @typedef {import ('../../../school/infrastructure/repositories/school-repository.js')} SchoolRepository
 */

const repositories = {
  certificationCenterRepository,
  certificationCenterForAdminRepository,
  dataProtectionOfficerRepository,
  complementaryCertificationHabilitationRepository,
  organizationForAdminRepository,
  organizationFeatureRepository,
  schoolRepository,
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

export { usecases };
