import boundedContext from '../../dependencies.json' with { type: 'json' };
import { injectDependencies } from '../utils/dependency-injection.js';
import * as countryRepository from './country-repository.js';
import * as knowledgeStateRepository from './knowledge-state-repository.js';

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {knowledgeStateRepository} KnowledgeStateRepository
 */
const repositoriesWithoutInjectedDependencies = {
  knowledgeStateRepository,
  countryRepository,
};

const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, {}, boundedContext);

export { repositories };
