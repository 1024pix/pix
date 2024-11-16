import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as learningContentConversionService from '../../../../../lib/domain/services/learning-content/learning-content-conversion-service.js';
import * as learningContentRepository from '../../../../../lib/infrastructure/repositories/learning-content-repository.js';
import * as targetProfileRepository from '../../../../../lib/infrastructure/repositories/target-profile-repository.js';
import { adminMemberRepository } from '../../../../shared/infrastructure/repositories/admin-member.repository.js';
import * as organizationRepository from '../../../../shared/infrastructure/repositories/organization-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as organizationsToAttachToTargetProfileRepository from '../../infrastructure/repositories/organizations-to-attach-to-target-profile-repository.js';
import * as targetProfileAdministrationRepository from '../../infrastructure/repositories/target-profile-administration-repository.js';
import * as targetProfileBondRepository from '../../infrastructure/repositories/target-profile-bond-repository.js';
import * as targetProfileForSpecifierRepository from '../../infrastructure/repositories/target-profile-for-specifier-repository.js';
import * as targetProfileForUpdateRepository from '../../infrastructure/repositories/target-profile-for-update-repository.js';
import * as targetProfileSummaryForAdminRepository from '../../infrastructure/repositories/target-profile-summary-for-admin-repository.js';

/**
 * @typedef {import('../../infrastructure/repositories/')} AdminMemberRepository
 * @typedef {import('../../../../../lib/domain/services/learning-content/learning-content-conversion-service.js')} LearningContentConversionService
 * @typedef {import('../../../../../lib/infrastructure/repositories/learning-content-repository.js')} LearningContentRepository
 * @typedef {import('../../../../shared/infrastructure/repositories/organization-repository.js')} OrganizationRepository
 * @typedef {import('../../infrastructure/repositories/organizations-to-attach-to-target-profile-repository.js')} OrganizationsToAttachToTargetProfileRepository
 * @typedef {import('../../infrastructure/repositories/target-profile-administration-repository.js')} TargetProfileAdministrationRepository
 * @typedef {import('../../infrastructure/repositories/target-profile-bond-repository.js')} TargetProfileBondRepository
 * @typedef {import('../../infrastructure/repositories/target-profile-for-specifier-repository.js')} TargetProfileForSpecifierRepository
 * @typedef {import('../../infrastructure/repositories/target-profile-for-update-repository.js')} TargetProfileForUpdateRepository
 * @typedef {import('../../../../../lib/infrastructure/repositories/target-profile-repository.js')} TargetProfileRepository
 * @typedef {import('../../infrastructure/repositories/target-profile-summary-for-admin-repository.js')} TargetProfileSummaryForAdminRepository
 */

const dependencies = {
  adminMemberRepository,
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

const path = dirname(fileURLToPath(import.meta.url));

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({
    path: join(path, './'),
    ignoredFileNames: ['index.js'],
  })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
