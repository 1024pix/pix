import * as migratedUserKnowledgeElementRepository from '../../../shared/infrastructure/repositories/migrated-user-knowledge-element-repository.ts';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import * as answersRepository from '../../infrastructure/repositories/answers-repository.js';
import * as assessmentsRepository from '../../infrastructure/repositories/assessments-repository.js';
import * as migratedUserKnowledgeElementExportFileRepository from '../../infrastructure/repositories/migrated-user-knowledge-element-export-file-repository.ts';
import * as migratedUserKnowledgeElementExportRepository from '../../infrastructure/repositories/migrated-user-knowledge-element-export-repository.ts';
import { exportMigratedUserKnowledgeElements } from './export-migrated-user-knowledge-elements.ts';
import { historizeAnswers } from './historize-answers.js';

/**
 * @typedef {answersRepository} AnswersRepository
 * @typedef {assessmentsRepository} AssessmentsRepository
 **/
const dependencies = {
  answersRepository,
  assessmentsRepository,
  migratedUserKnowledgeElementRepository,
  migratedUserKnowledgeElementExportFileRepository,
  migratedUserKnowledgeElementExportRepository,
};

const usecasesWithoutInjectedDependencies = {
  exportMigratedUserKnowledgeElements,
  historizeAnswers,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
