import boundedContext from '../../dependencies.json' with { type: 'json' };
import { injectDependencies } from '../utils/dependency-injection.js';
import * as countryRepository from './country-repository.js';
import * as knowledgeElementRepository from './knowledge-element-repository.js';

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {knowledgeElementRepository} KnowledgeElementRepository
 */
const repositoriesWithoutInjectedDependencies = {
  knowledgeElementRepository,
  countryRepository,
};

const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, {}, boundedContext);

export { repositories };
