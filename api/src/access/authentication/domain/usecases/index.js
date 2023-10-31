import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { tokenService } from '../../../../shared/domain/services/token-service.js';
import * as userRepository from '../../../../shared/infrastructure/repositories/user-repository.js';
import * as refreshTokenService from '../services/refresh-token-service.js';
import * as pixAuthenticationService from '../services/pix-authentication-service.js';
import * as userLoginRepository from '../../../../shared/infrastructure/repositories/user-login-repository.js';
import * as adminMemberRepository from '../../../../shared/infrastructure/repositories/admin-member-repository.js';

const path = dirname(fileURLToPath(import.meta.url));

const dependencies = {
  refreshTokenService,
  pixAuthenticationService,
  tokenService,
  userRepository,
  userLoginRepository,
  adminMemberRepository,
};

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({ path: join(path, './'), ignoredFileNames: ['index.js'] })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
