import boundedContext from '../../dependencies.json' with { type: 'json' };
import { repositories as sharedInjectedRepositories } from '../../infrastructure/repositories/index.js';
import { injectDependencies } from '../../infrastructure/utils/dependency-injection.js';
import { findCountries } from './find-countries.js';

const dependencies = {
  ...sharedInjectedRepositories,
};

const usecasesWithoutInjectedDependencies = {
  findCountries,
};

const sharedUsecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies, boundedContext);

export { sharedUsecases };
