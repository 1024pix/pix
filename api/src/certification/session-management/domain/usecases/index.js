// eslint-disable import/no-restricted-paths
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { pickChallengeService } from '../../../../../src/evaluation/domain/services/pick-challenge-service.js';
import * as flashAlgorithmService from '../../../../certification/flash-certification/domain/services/algorithm-methods/flash.js';
import * as scoringCertificationService from '../../../../certification/shared/domain/services/scoring-certification-service.js';
import * as placementProfileService from '../../../../shared/domain/services/placement-profile-service.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import { importNamedExportsFromDirectory } from '../../../../shared/infrastructure/utils/import-named-exports-from-directory.js';
import * as certificationBadgesService from '../../../shared/domain/services/certification-badges-service.js';
import * as certificationCpfService from '../../../shared/domain/services/certification-cpf-service.js';
import * as temporaryCompanionStorageService from '../../../shared/domain/services/temporary-companion-storage-service.js';
import {
  answerRepository,
  assessmentRepository,
  assessmentResultRepository,
  certificationChallengeRepository,
  challengeRepository,
  competenceMarkRepository,
  flashAlgorithmConfigurationRepository,
  sessionRepositories,
  sharedCompetenceMarkRepository,
} from '../../infrastructure/repositories/index.js';
import { cpfExportsStorage } from '../../infrastructure/storage/cpf-exports-storage.js';
import { cpfReceiptsStorage } from '../../infrastructure/storage/cpf-receipts-storage.js';

/**
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationCourseRepository} CertificationCourseRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationOfficerRepository} CertificationOfficerRepository
 * @typedef {import('../../infrastructure/repositories/index.js').FinalizedSessionRepository} FinalizedSessionRepository
 * @typedef {import('../../infrastructure/repositories/index.js').JuryCertificationRepository} JuryCertificationRepository
 * @typedef {import('../../infrastructure/repositories/index.js').JurySessionRepository} JurySessionRepository
 * @typedef {import('../../infrastructure/repositories/index.js').SessionForInvigilatorKitRepository} SessionForInvigilatorKitRepository
 * @typedef {import('../../infrastructure/repositories/index.js').AssessmentRepository} AssessmentRepository
 * @typedef {import('../../infrastructure/repositories/index.js').AssessmentResultRepository} AssessmentResultRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CompetenceMarkRepository} CompetenceMarkRepository
 * @typedef {import('../../infrastructure/repositories/index.js').ChallengeRepository} ChallengeRepository
 * @typedef {import('../../infrastructure/repositories/index.js').AnswerRepository} AnswerRepository
 * @typedef {import('../../infrastructure/repositories/index.js').IssueReportCategoryRepository} IssueReportCategoryRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationIssueReportRepository} CertificationIssueReportRepository
 * @typedef {import('../../infrastructure/repositories/index.js').SessionJuryCommentRepository} SessionJuryCommentRepository
 * @typedef {import('../../infrastructure/repositories/index.js').SessionRepository} SessionRepository
 * @typedef {import('../../infrastructure/repositories/index.js').SessionForSupervisingRepository} SessionForSupervisingRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationReportRepository} CertificationReportRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CompetenceMarkRepository} CompetenceMarkRepository
 * @typedef {import('../../infrastructure/repositories/index.js').FlashAlgorithmConfigurationRepository} FlashAlgorithmConfigurationRepository
 * @typedef {import('../../infrastructure/repositories/index.js').ComplementaryCertificationCourseResultRepository} ComplementaryCertificationCourseResultRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationAssessmentRepository} CertificationAssessmentRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationCpfCityRepository} CertificationCpfCityRepository
 * @typedef {import('../../infrastructure/repositories/index.js').CertificationCpfCountryRepository} CertificationCpfCountryRepository
 * @typedef {import('../../infrastructure/storage/cpf-receipts-storage.js')} CpfReceiptsStorage
 * @typedef {import('../../infrastructure/storage/cpf-exports-storage.js')} CpfExportsStorage
 * @typedef {import('../../../shared/domain/services/certification-badges-service.js')} CertificationBadgesService
 * @typedef {import('../../../shared/domain/services/temporary-companion-storage-service.js')} TemporaryCompanionStorageService
 * @typedef {import('../../../shared/domain/services/scoring-certification-service.js')} ScoringCertificationService
 * @typedef {import('../../../../shared/domain/services/placement-profile-service.js')} PlacementProfileService
 * @typedef {import('../../../shared/domain/services/certification-cpf-service.js')} CertificationCpfService
 **/

/**
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {answerRepository} AnswerRepository
 * @typedef {assessmentRepository} AssessmentRepository
 * @typedef {assessmentResultRepository} AssessmentResultRepository
 * @typedef {certificationAssessmentRepository} CertificationAssessmentRepository
 * @typedef {certificationBadgesService} CertificationBadgesService
 * @typedef {competenceMarkRepository} CompetenceMarkRepository
 * @typedef {certificationCourseRepository} CertificationCourseRepository
 * @typedef {certificationChallengeLiveAlertRepository} CertificationChallengeLiveAlertRepository
 * @typedef {certificationOfficerRepository} CertificationOfficerRepository
 * @typedef {certificationChallengeRepository} CertificationChallengeRepository
 * @typedef {challengeRepository} ChallengeRepository
 * @typedef {competenceMarkRepository} CompetenceMarkRepository
 * @typedef {finalizedSessionRepository} FinalizedSessionRepository
 * @typedef {juryCertificationRepository} JuryCertificationRepository
 * @typedef {jurySessionRepository} JurySessionRepository
 * @typedef {sessionForInvigilatorKitRepository} SessionForInvigilatorKitRepository
 * @typedef {sessionForSupervisingRepository} SessionForSupervisingRepository
 * @typedef {issueReportCategoryRepository} IssueReportCategoryRepository
 * @typedef {certificationIssueReportRepository} CertificationIssueReportRepository
 * @typedef {complementaryCertificationCourseResultRepository} ComplementaryCertificationCourseResultRepository
 * @typedef {sessionJuryCommentRepository} SessionJuryCommentRepository
 * @typedef {sessionRepository} SessionRepository
 * @typedef {certificationReportRepository} CertificationReportRepository
 * @typedef {certificationCpfCountryRepository} CertificationCpfCountryRepository
 * @typedef {certificationCpfCityRepository} CertificationCpfCityRepository
 * @typedef {cpfReceiptsStorage} CpfReceiptsStorage
 * @typedef {cpfExportsStorage} CpfExportsStorage
 * @typedef {TemporaryCompanionStorageService} TemporaryCompanionStorageService
 * @typedef {placementProfileService} PlacementProfileService
 * @typedef {scoringCertificationService} ScoringCertificationService
 * @typedef {certificationCpfService} CertificationCpfService
 * @typedef {pickChallengeService} PickChallengeService
 * @typedef {flashAlgorithmService} FlashAlgorithmService
 * @typedef {flashAlgorithmConfigurationRepository} FlashAlgorithmConfigurationRepository
 **/
const dependencies = {
  ...sessionRepositories,
  assessmentRepository,
  assessmentResultRepository,
  answerRepository,
  sharedCompetenceMarkRepository,
  challengeRepository,
  competenceMarkRepository,
  cpfReceiptsStorage,
  cpfExportsStorage,
  certificationBadgesService,
  temporaryCompanionStorageService,
  placementProfileService,
  scoringCertificationService,
  certificationCpfService,
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
