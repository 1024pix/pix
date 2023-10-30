import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { importNamedExportsFromDirectory } from '../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import { injectDependencies } from '../../../shared/infrastructure/utils/dependency-injection.js';
import * as answerRepository from '../../infrastructure/repositories/answer-repository.js';
import * as assessmentRepository from '../../../shared/infrastructure/repositories/assessment-repository.js';
import * as competenceRepository from '../../../shared/infrastructure/repositories/competence-repository.js';
import * as competenceEvaluationRepository from '../../infrastructure/repositories/competence-evaluation-repository.js';
import { getCompetenceLevel } from '../services/get-competence-level.js';

const path = dirname(fileURLToPath(import.meta.url));

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({ path: join(path, './'), ignoredFileNames: ['index.js'] })),
};

const dependencies = {
  answerRepository,
  assessmentRepository,
  competenceEvaluationRepository,
  competenceRepository,
  getCompetenceLevel,
};

const evaluationUsecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { evaluationUsecases };
