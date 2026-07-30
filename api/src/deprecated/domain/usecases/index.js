import * as membershipRepository from '../../../../src/team/infrastructure/repositories/membership.repository.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import { userOrgaSettingsRepository } from '../../../team/infrastructure/repositories/user-orga-settings-repository.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import { prescriberRepository } from '../../infrastructure/repositories/prescriber-repository.js';

const dependencies = {
  prescriberRepository,
  membershipRepository,
  userOrgaSettingsRepository,
};

import { getPrescriber } from './get-prescriber.js';

const usecasesWithoutInjectedDependencies = {
  getPrescriber,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies, boundedContext);

export { usecases };
