import { join } from 'node:path';

import * as mailService from '../../../../lib/domain/services/mail-service.js';
import * as campaignRepository from '../../../../lib/infrastructure/repositories/campaign-repository.js';
import * as cryptoService from '../../../shared/domain/services/crypto-service.js';
import * as userService from '../../../shared/domain/services/user-service.js';
import * as passwordValidator from '../../../shared/domain/validators/password-validator.js';
import * as userValidator from '../../../shared/domain/validators/user-validator.js';
import * as authenticationMethodRepository from '../../../shared/infrastructure/repositories/authentication-method-repository.js';
import * as userLoginRepository from '../../../shared/infrastructure/repositories/user-login-repository.js';
import * as userRepository from '../../../shared/infrastructure/repositories/user-repository.js';
import * as userToCreateRepository from '../../../shared/infrastructure/repositories/user-to-create-repository.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../shared/infrastructure/utils/import-named-exports-from-directory.js';

const dependencies = {
  authenticationMethodRepository,
  campaignRepository,
  userLoginRepository,
  userRepository,
  userToCreateRepository,
  cryptoService,
  mailService,
  userService,
  userValidator,
  passwordValidator,
};

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({ path: join(import.meta.dirname, './'), ignoredFileNames: ['index.js'] })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
