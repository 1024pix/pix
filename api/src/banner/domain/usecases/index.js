import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import * as informationBannerRepository from '../../infrastructure/repositories/information-banner-repository.js';

/**
 *
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {informationBannerRepository} InformationBannerRepository
 **/
const dependencies = {
  informationBannerRepository,
};

import { getInformationBanner } from './get-information-banner.js';

const usecasesWithoutInjectedDependencies = {
  getInformationBanner,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies, boundedContext);

/**
 * @typedef {dependencies} dependencies
 */
export { usecases };
