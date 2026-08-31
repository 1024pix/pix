import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import * as repositories from '../../infrastructure/repositories/index.js';

const dependencies = {
  ...repositories,
};

import { converse } from './converse.js';

const usecasesWithoutInjectedDependencies = {
  converse,
};

export const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies, boundedContext);
