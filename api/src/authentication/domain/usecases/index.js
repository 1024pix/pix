import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as authenticationMethodRepository from '../../../../lib/infrastructure/repositories/authentication-method-repository.js';
import { config } from '../../../shared/config.js';
import { tokenService } from '../../../shared/domain/services/token-service.js';
import * as adminMemberRepository from '../../../shared/infrastructure/repositories/admin-member-repository.js';
import * as userLoginRepository from '../../../shared/infrastructure/repositories/user-login-repository.js';
import * as userRepository from '../../../shared/infrastructure/repositories/user-repository.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as oidcProviderRepository from '../../infrastructure/repositories/oidc-provider-repository.js';
import * as pixAuthenticationService from '../services/pix-authentication-service.js';
import * as refreshTokenService from '../services/refresh-token-service.js';

const path = dirname(fileURLToPath(import.meta.url));

const dependencies = {
  authenticationMethodRepository,
  config,
  refreshTokenService,
  pixAuthenticationService,
  tokenService,
  userRepository,
  userLoginRepository,
  adminMemberRepository,
  oidcProviderRepository,
};

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({ path: join(path, './'), ignoredFileNames: ['index.js'] })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
