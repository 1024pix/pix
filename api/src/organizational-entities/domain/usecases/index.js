import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as organizationFeatureRepository from '../../infrastructure/repositories/organization-feature-repository.js';
import { organizationForAdminRepository } from '../../infrastructure/repositories/organization-for-admin.repository.js';

const path = dirname(fileURLToPath(import.meta.url));

/**
 * @typedef {import ('../../infrastructure/repositories/organization-feature-repository.js')} OrganizationFeatureRepository
 * @typedef {import ('../../infrastructure/repositories/organization-for-admin.repository.js')} OrganizationForAdminRepository
 */

const repositories = {
  organizationForAdminRepository,
  organizationFeatureRepository,
};

const dependencies = Object.assign({}, repositories);

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({ path: join(path, './'), ignoredFileNames: ['index.js'] })),
};

/**
 * @typedef OrganizationalEntitiesUsecases
 * @property {addOrganizationFeatureInBatch} addOrganizationFeatureInBatch
 * @property {attachChildOrganizationToOrganization} attachChildOrganizationToOrganization
 * @property {updateOrganizationsInBatch} updateOrganizationsInBatch
 */

/**
 * @type {OrganizationalEntitiesUsecases}
 */
const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
