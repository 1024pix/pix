import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as complementaryCertificationBadgeRepository from '../../../certification/complementary-certification/infrastructure/repositories/complementary-certification-badge-repository.js';
import * as certificationChallengeLiveAlertRepository from '../../../certification/shared/infrastructure/repositories/certification-challenge-live-alert-repository.js';
import * as certificationCompanionAlertRepository from '../../../certification/shared/infrastructure/repositories/certification-companion-alert-repository.js';
import { evaluationUsecases } from '../../../evaluation/domain/usecases/index.js';
import * as badgeRepository from '../../../evaluation/infrastructure/repositories/badge-repository.js';
import * as challengesAPI from '../../../learning-content/application/api/challenges-api.js';
import * as answerRepository from '../../infrastructure/repositories/answer-repository.js';
import * as assessmentRepository from '../../infrastructure/repositories/assessment-repository.js';
import * as challengeRepository from '../../infrastructure/repositories/challenge-repository.js';
import * as competenceRepository from '../../infrastructure/repositories/competence-repository.js';
import * as courseRepository from '../../infrastructure/repositories/course-repository.js';
import { repositories as sharedInjectedRepositories } from '../../infrastructure/repositories/index.js';
import { injectDependencies } from '../../infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../infrastructure/utils/import-named-exports-from-directory.js';
const path = dirname(fileURLToPath(import.meta.url));

const usecasesWithoutInjectedDependencies = {
  ...(await importNamedExportsFromDirectory({ path: join(path, './'), ignoredFileNames: ['index.js'] })),
};

const dependencies = {
  assessmentRepository,
  certificationCompanionAlertRepository,
  competenceRepository,
  answerRepository,
  courseRepository,
  complementaryCertificationBadgeRepository,
  certificationChallengeLiveAlertRepository,
  badgeRepository,
  challengeRepository,
  challengesAPI,
  evaluationUsecases,
  ...sharedInjectedRepositories,
};

const sharedUsecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

export { sharedUsecases };
