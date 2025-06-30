import * as certificationEvaluationApi from '../../../certification/evaluation/application/api/select-next-certification-challenge-api.js';
import * as certificationEvaluationRepository from '../../../certification/shared/infrastructure/repositories/certification-challenge-repository.js';
import * as campaignsAPI from '../../../prescription/campaign/application/api/campaigns-api.js';
import * as knowledgeElementSnapshotAPI from '../../../prescription/campaign/application/api/knowledge-element-snapshots-api.js';
import { injectDependencies } from '../utils/dependency-injection.js';
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
};

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {certificationEvaluationApi} CertificationEvaluationApi
 * @typedef {knowledgeElementSnapshotAPI} KnowledgeElementSnapshotAPI
 */
const dependencies = {
  certificationEvaluationApi,
  knowledgeElementSnapshotAPI,
  campaignsAPI,
};

const repositories = injectDependencies(repositoriesWithoutInjectedDependencies, dependencies);

export { repositories };
