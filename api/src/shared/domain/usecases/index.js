import * as certificationChallengeLiveAlertRepository from '../../../certification/shared/infrastructure/repositories/certification-challenge-live-alert-repository.js';
import * as certificationCompanionAlertRepository from '../../../certification/shared/infrastructure/repositories/certification-companion-alert-repository.js';
import * as challengeToPlayApi from '../../../evaluation/application/api/challenge-to-play-api.js';
import { evaluationUsecases } from '../../../evaluation/domain/usecases/index.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import * as assessmentRepository from '../../infrastructure/repositories/assessment-repository.js';
import * as competenceRepository from '../../infrastructure/repositories/competence-repository.js';
import * as courseRepository from '../../infrastructure/repositories/course-repository.js';
import { repositories as sharedInjectedRepositories } from '../../infrastructure/repositories/index.js';
import { injectDependencies } from '../../infrastructure/utils/dependency-injection.js';

const dependencies = {
  assessmentRepository,
  certificationCompanionAlertRepository,
  competenceRepository,
  courseRepository,
  certificationChallengeLiveAlertRepository,
  challengeToPlayApi,
  evaluationUsecases,
  ...sharedInjectedRepositories,
};

import { findCountries } from './find-countries.js';
import { updateAssessmentWithNextChallenge } from './update-assessment-with-next-challenge.js';

const usecasesWithoutInjectedDependencies = {
  findCountries,
  updateAssessmentWithNextChallenge,
};

const sharedUsecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies, boundedContext);

export { sharedUsecases };
