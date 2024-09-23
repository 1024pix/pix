import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { pickChallengeService } from '../../../../evaluation/domain/services/pick-challenge-service.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as flashAlgorithmService from '../../../flash-certification/domain/services/algorithm-methods/flash.js';
import {
  answerRepository,
  assessmentRepository,
  assessmentResultRepository,
  certificationChallengeRepository,
  challengeRepository,
  competenceMarkRepository,
  cpfExportRepository,
  flashAlgorithmConfigurationRepository,
  sessionRepositories,
  sharedCompetenceMarkRepository,
} from '../../../session-management/infrastructure/repositories/index.js';
import * as certificationCandidateRepository from '../../infrastructure/repositories/certification-candidate-repository.js';

const dependencies = {
  ...sessionRepositories,
  certificationCandidateRepository,
  assessmentRepository,
  assessmentResultRepository,
  answerRepository,
  sharedCompetenceMarkRepository,
  challengeRepository,
  competenceMarkRepository,
  cpfExportRepository,
  certificationChallengeRepository,
  flashAlgorithmConfigurationRepository,
  flashAlgorithmService,
  pickChallengeService,
};

const path = dirname(fileURLToPath(import.meta.url));

/**
 * Note : current ignoredFileNames are injected in * {@link file://./../../../shared/domain/usecases/index.js}
 * This is in progress, because they should be injected in this file and not by shared sub-domain
 * The only remaining file ignored should be index.js
 */
const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({
    path: join(path, './'),
    ignoredFileNames: ['index.js'],
  })),
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { usecases };
