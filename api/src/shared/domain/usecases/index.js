import boundedContext from '../../dependencies.json' with { type: 'json' };
import { repositories as sharedInjectedRepositories } from '../../infrastructure/repositories/index.js';
import * as knowledgeStateMigrationRepository from '../../infrastructure/repositories/knowledge-state-migration-repository.ts';
import * as knowledgeStateRepository from '../../infrastructure/repositories/knowledge-state-repository.ts';
import * as skillRepository from '../../infrastructure/repositories/skill-repository.js';
import * as userCompetenceScoreRepository from '../../infrastructure/repositories/user-competence-score-repository.ts';
import { injectDependencies } from '../../infrastructure/utils/dependency-injection.js';
import { findCountries } from './find-countries.js';
import { migrateUserToKnowledgeStates } from './migrate-user-to-knowledge-states.ts';

const dependencies = {
  ...sharedInjectedRepositories,
  knowledgeStateMigrationRepository,
  knowledgeStateRepository,
  skillRepository,
  userCompetenceScoreRepository,
};

const usecasesWithoutInjectedDependencies = {
  findCountries,
  migrateUserToKnowledgeStates,
};

const sharedUsecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies, boundedContext);

export { sharedUsecases };
