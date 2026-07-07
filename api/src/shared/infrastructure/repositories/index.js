import * as certificationEvaluationApi from '../../../certification/evaluation/application/api/certification-evaluation-api.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import { injectDependencies } from '../utils/dependency-injection.js';
import * as certificationEvaluationRepository from './certification-evaluation-repository.js';
import * as countryRepository from './country-repository.js';
import * as knowledgeElementRepository from './knowledge-element-repository.js';

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {certificationEvaluationRepository} CertificationEvaluationRepository
 * @typedef {knowledgeElementRepository} KnowledgeElementRepository
 */
const repositoriesWithoutInjectedDependencies = {
  certificationEvaluationRepository,
  knowledgeElementRepository,
  countryRepository,
};

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {certificationEvaluationApi} CertificationEvaluationApi
 */
const dependencies = {
  certificationEvaluationApi,
};

const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies, boundedContext);

export { repositories };
