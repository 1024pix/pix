import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import * as campaignParticipationRepository from '../../infrastructure/repositories/campaign-participation-repository.js';
import * as campaignParticipantRepository from '../../infrastructure/repositories/campaign-participant-repository.js';

import * as assessmentRepository from '../../../../shared/infrastructure/repositories/assessment-repository.js';

// TODO : use an API for this import
import * as campaignRepository from '../../../../../lib/infrastructure/repositories/campaign-repository.js';
import * as knowledgeElementRepository from '../../../../../lib/infrastructure/repositories/knowledge-element-repository.js';
import * as competenceEvaluationRepository from '../../../../evaluation/infrastructure/repositories/competence-evaluation-repository.js';

import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';

const dependencies = {
  campaignRepository,
  campaignParticipationRepository,
  campaignParticipantRepository,
  knowledgeElementRepository,
  assessmentRepository,
  competenceEvaluationRepository,
};

const path = dirname(fileURLToPath(import.meta.url));

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({
    path: join(path, './'),
    ignoredFileNames: ['index.js'],
  })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
