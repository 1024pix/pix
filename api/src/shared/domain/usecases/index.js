import * as complementaryCertificationBadgeRepository from '../../../certification/configuration/infrastructure/repositories/complementary-certification-badge-repository.js';
import * as certificationChallengeLiveAlertRepository from '../../../certification/shared/infrastructure/repositories/certification-challenge-live-alert-repository.js';
import * as certificationCompanionAlertRepository from '../../../certification/shared/infrastructure/repositories/certification-companion-alert-repository.js';
import * as challengeToPlayApi from '../../../evaluation/application/api/challenge-to-play-api.js';
import { evaluationUsecases } from '../../../evaluation/domain/usecases/index.js';
import * as badgeRepository from '../../../evaluation/infrastructure/repositories/badge-repository.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import * as answerRepository from '../../infrastructure/repositories/answer-repository.js';
import * as assessmentRepository from '../../infrastructure/repositories/assessment-repository.js';
import * as competenceRepository from '../../infrastructure/repositories/competence-repository.js';
import * as courseRepository from '../../infrastructure/repositories/course-repository.js';
import { repositories as sharedInjectedRepositories } from '../../infrastructure/repositories/index.js';
import { injectDependencies } from '../../infrastructure/utils/dependency-injection.js';

const dependencies = {
  assessmentRepository,
  certificationCompanionAlertRepository,
  competenceRepository,
  answerRepository,
  courseRepository,
  complementaryCertificationBadgeRepository,
  certificationChallengeLiveAlertRepository,
  badgeRepository,
  challengeToPlayApi,
  evaluationUsecases,
  ...sharedInjectedRepositories,
};

import { updateLastQuestionState } from '../../../evaluation/domain/usecases/update-last-question-state.js';
import { deleteUnassociatedBadge } from './delete-unassociated-badge.js';
import { findCountries } from './find-countries.js';
import { updateAssessmentWithNextChallenge } from './update-assessment-with-next-challenge.js';

const usecasesWithoutInjectedDependencies = {
  deleteUnassociatedBadge,
  findCountries,
  updateAssessmentWithNextChallenge,
  updateLastQuestionState,
};

const sharedUsecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies, boundedContext);

export { sharedUsecases };
