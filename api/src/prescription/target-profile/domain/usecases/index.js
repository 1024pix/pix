import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as learningContentConversionService from '../../../../../lib/domain/services/learning-content/learning-content-conversion-service.js';
import * as learningContentRepository from '../../../../../lib/infrastructure/repositories/learning-content-repository.js';
import * as targetProfileRepository from '../../../../../lib/infrastructure/repositories/target-profile-repository.js';
import * as adminMemberRepository from '../../../../shared/infrastructure/repositories/admin-member-repository.js';
import * as targetProfileForAdminRepository from '../../../../shared/infrastructure/repositories/target-profile-for-admin-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as organizationsToAttachToTargetProfileRepository from '../../infrastructure/repositories/organizations-to-attach-to-target-profile-repository.js';
import * as targetProfileForSpecifierRepository from '../../infrastructure/repositories/target-profile-for-specifier-repository.js';

const dependencies = {
  targetProfileForAdminRepository,
  learningContentConversionService,
  learningContentRepository,
  adminMemberRepository,
  targetProfileForSpecifierRepository,
  organizationsToAttachToTargetProfileRepository,
  targetProfileRepository,
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
