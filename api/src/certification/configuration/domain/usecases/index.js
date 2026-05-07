import * as mailService from '../../../../../src/certification/shared/domain/services/mail-service.js';
import * as challengeRepository from '../../../../shared/infrastructure/repositories/challenge-repository.js';
import * as skillRepository from '../../../../shared/infrastructure/repositories/skill-repository.js';
import * as tubeRepository from '../../../../shared/infrastructure/repositories/tube-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import * as targetProfileHistoryRepository from '../../../shared/infrastructure/repositories/target-profile-history-repository.js';
import * as activeCalibratedChallengeRepository from '../../infrastructure/repositories/active-calibrated-challenge-repository.js';
import * as attachableTargetProfileRepository from '../../infrastructure/repositories/attachable-target-profiles-repository.js';
import * as centerRepository from '../../infrastructure/repositories/center-repository.js';
import * as complementaryCertificationBadgesRepository from '../../infrastructure/repositories/complementary-certification-badge-repository.js';
import * as complementaryCertificationForTargetProfileAttachmentRepository from '../../infrastructure/repositories/complementary-certification-for-target-profile-attachment-repository.js';
import * as complementaryCertificationRepository from '../../infrastructure/repositories/complementary-certification-repository.js';
import * as frameworkChallengesRepository from '../../infrastructure/repositories/framework-challenges-repository.js';
import * as learningContentRepository from '../../infrastructure/repositories/learning-content-repository.js';
import * as organizationRepository from '../../infrastructure/repositories/organization-repository.js';
import * as ScoBlockedAccessDatesRepository from '../../infrastructure/repositories/sco-blocked-access-dates-repository.js';
import * as versionRepository from '../../infrastructure/repositories/version-repository.js';
import { attachBadges } from './attach-badges.js';
import { calibrateFrameworkVersion } from './calibrate-framework-version.js';
import { createCertificationVersion } from './create-certification-version.js';
import { deleteCertificationVersion } from './delete-certification-version.js';
import { exportScoWhitelist } from './export-sco-whitelist.js';
import { findCertificationFrameworks } from './find-certification-frameworks.js';
import { findComplementaryCertifications } from './find-complementary-certifications.js';
import { getComplementaryCertificationForTargetProfileAttachmentRepository } from './get-complementary-certification-for-target-profile-attachment.js';
import { getComplementaryCertificationTargetProfileHistory } from './get-complementary-certification-target-profile-history.js';
import { getFrameworkHistory } from './get-framework-history.js';
import { getScoBlockedAccessDates } from './get-sco-blocked-access-dates.js';
import { getVersionById } from './get-version-by-id.js';
import { importScoWhitelist } from './import-sco-whitelist.js';
import { searchAttachableTargetProfiles } from './search-attachable-target-profiles.js';
import { sendTargetProfileNotifications } from './send-target-profile-notifications.js';
import { updateScoBlockedAccessDate } from './update-sco-blocked-access-date.js';
import { updateVersion } from './update-version.js';

/**
 *
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {activeCalibratedChallengeRepository} ActiveCalibratedChallengeRepository
 * @typedef {attachableTargetProfileRepository} AttachableTargetProfileRepository
 * @typedef {candidateRepository} CandidateRepository
 * @typedef {centerRepository} CenterRepository
 * @typedef {challengeRepository} ChallengeRepository
 * @typedef {complementaryCertificationRepository} ComplementaryCertificationRepository
 * @typedef {complementaryCertificationBadgesRepository} ComplementaryCertificationBadgesRepository
 * @typedef {frameworkChallengesRepository} FrameworkChallengesRepository
 * @typedef {complementaryCertificationForTargetProfileAttachmentRepository} ComplementaryCertificationForTargetProfileAttachmentRepository
 * @typedef {learningContentRepository} LearningContentRepository
 * @typedef {mailService} MailService
 * @typedef {organizationRepository} OrganizationRepository
 * @typedef {skillRepository} SkillRepository
 * @typedef {tubeRepository} TubeRepository
 * @typedef {ScoBlockedAccessDatesRepository} ScoBlockedAccessDatesRepository
 * @typedef {versionRepository} VersionRepository
 **/
const dependencies = {
  activeCalibratedChallengeRepository,
  attachableTargetProfileRepository,
  centerRepository,
  ScoBlockedAccessDatesRepository,
  challengeRepository,
  complementaryCertificationBadgesRepository,
  complementaryCertificationForTargetProfileAttachmentRepository,
  complementaryCertificationRepository,
  frameworkChallengesRepository,
  learningContentRepository,
  mailService,
  organizationRepository,
  skillRepository,
  targetProfileHistoryRepository,
  tubeRepository,
  versionRepository,
};

const usecasesWithoutInjectedDependencies = {
  attachBadges,
  calibrateFrameworkVersion,
  createCertificationVersion,
  deleteCertificationVersion,
  exportScoWhitelist,
  findCertificationFrameworks,
  findComplementaryCertifications,
  getComplementaryCertificationForTargetProfileAttachmentRepository,
  getComplementaryCertificationTargetProfileHistory,
  getFrameworkHistory,
  getScoBlockedAccessDates,
  getVersionById,
  importScoWhitelist,
  searchAttachableTargetProfiles,
  sendTargetProfileNotifications,
  updateScoBlockedAccessDate,
  updateVersion,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies);

/**
 * @typedef {dependencies} dependencies
 */
export { usecases };
