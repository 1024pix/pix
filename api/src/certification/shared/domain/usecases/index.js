import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import * as badgeRepository from '../../../../../lib/infrastructure/repositories/badge-repository.js';
import * as complementaryCertificationBadgesRepository from '../../../complementary-certification/infrastructure/repositories/complementary-certification-badge-repository.js';
import * as complementaryCertificationRepository from '../../../../../lib/infrastructure/repositories/complementary-certification-repository.js';
import * as sessionCodeService from '../../../session/domain/services/session-code-service.js';
import * as sessionValidator from '../../../session/domain/validators/session-validator.js';
import * as userRepository from '../../../../../src/shared/infrastructure/repositories/user-repository.js';
import * as sessionRepository from '../../../session/infrastructure/repositories/session-repository.js';
import * as certificationCenterRepository from '../../../shared/infrastructure/repositories/certification-center-repository.js';

import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';

const dependencies = {
  badgeRepository,
  certificationCenterRepository,
  complementaryCertificationBadgesRepository,
  complementaryCertificationRepository,
  sessionCodeService,
  sessionRepository,
  sessionValidator,
  userRepository,
};

const path = dirname(fileURLToPath(import.meta.url));

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({
    path: join(path, '../../../session/domain/usecases/'),
    ignoredFileNames: ['index.js'],
  })),
  ...(await importNamedExportsFromDirectory({
    path: join(path, '../../../complementary-certification/domain/usecases/'),
  })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
