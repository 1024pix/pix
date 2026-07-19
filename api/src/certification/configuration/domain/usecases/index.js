import * as mailService from '../../../../../src/certification/shared/domain/services/mail-service.js';
import * as challengeRepository from '../../../../shared/infrastructure/repositories/challenge-repository.js';
import * as skillRepository from '../../../../shared/infrastructure/repositories/skill-repository.js';
import * as tubeRepository from '../../../../shared/infrastructure/repositories/tube-repository.js';
import { injectDependencies } from '../../../../shared/infrastructure/utils/dependency-injection.js';
import boundedContext from '../../dependencies.json' with { type: 'json' };
import * as attachableTargetProfileRepository from '../../infrastructure/repositories/attachable-target-profiles-repository.js';
import * as centerRepository from '../../infrastructure/repositories/center-repository.js';
import * as certificationInfoRepository from '../../infrastructure/repositories/certification-info-repository.js';
import * as complementaryCertificationBadgesRepository from '../../infrastructure/repositories/complementary-certification-badge-repository.js';
import * as complementaryCertificationForTargetProfileAttachmentRepository from '../../infrastructure/repositories/complementary-certification-for-target-profile-attachment-repository.js';
import * as complementaryCertificationRepository from '../../infrastructure/repositories/complementary-certification-repository.js';
import * as organizationRepository from '../../infrastructure/repositories/organization-repository.js';
import * as ScoBlockedAccessDatesRepository from '../../infrastructure/repositories/sco-blocked-access-dates-repository.js';
import * as versionDetailsRepository from '../../infrastructure/repositories/version-details-repository.js';
import * as versionRepository from '../../infrastructure/repositories/version-repository.js';
import { attachBadges } from './attach-badges.js';
import { createDraft } from './create-draft.js';
import { deleteVersion } from './delete-version.js';
import { exportScoWhitelist } from './export-sco-whitelist.js';
import { findComplementaryCertifications } from './find-complementary-certifications.js';
import { getComplementaryCertificationForTargetProfileAttachmentRepository } from './get-complementary-certification-for-target-profile-attachment.js';
import { getInfo } from './get-info.js';
import { getScoBlockedAccessDates } from './get-sco-blocked-access-dates.js';
import { getVersionById } from './get-version-by-id.js';
import { importScoWhitelist } from './import-sco-whitelist.js';
import { searchAttachableTargetProfiles } from './search-attachable-target-profiles.js';
import { sendTargetProfileNotifications } from './send-target-profile-notifications.js';
import { updateScoBlockedAccessDate } from './update-sco-blocked-access-date.js';
import { updateVersion } from './update-version.js';
import { updateVersionComment } from './update-version-comment.js';

/**
 *
 * Using {@link https://jsdoc.app/tags-type "Closure Compiler's syntax"} to document injected dependencies
 *
 * @typedef {attachableTargetProfileRepository} AttachableTargetProfileRepository
 * @typedef {candidateRepository} CandidateRepository
 * @typedef {centerRepository} CenterRepository
 * @typedef {challengeRepository} ChallengeRepository
 * @typedef {complementaryCertificationRepository} ComplementaryCertificationRepository
 * @typedef {complementaryCertificationBadgesRepository} ComplementaryCertificationBadgesRepository
 * @typedef {complementaryCertificationForTargetProfileAttachmentRepository} ComplementaryCertificationForTargetProfileAttachmentRepository
 * @typedef {mailService} MailService
 * @typedef {organizationRepository} OrganizationRepository
 * @typedef {skillRepository} SkillRepository
 * @typedef {tubeRepository} TubeRepository
 * @typedef {ScoBlockedAccessDatesRepository} ScoBlockedAccessDatesRepository
 * @typedef {versionRepository} VersionRepository
 * @typedef {versionDetailsRepository} VersionDetailsRepository
 **/
const dependencies = {
  attachableTargetProfileRepository,
  centerRepository,
  ScoBlockedAccessDatesRepository,
  certificationInfoRepository,
  challengeRepository,
  complementaryCertificationBadgesRepository,
  complementaryCertificationForTargetProfileAttachmentRepository,
  complementaryCertificationRepository,
  mailService,
  organizationRepository,
  skillRepository,
  tubeRepository,
  versionRepository,
  versionDetailsRepository,
};

const usecasesWithoutInjectedDependencies = {
  attachBadges,
  createDraft,
  deleteVersion,
  exportScoWhitelist,
  findComplementaryCertifications,
  getComplementaryCertificationForTargetProfileAttachmentRepository,
  getInfo,
  getScoBlockedAccessDates,
  getVersionById,
  importScoWhitelist,
  searchAttachableTargetProfiles,
  sendTargetProfileNotifications,
  updateScoBlockedAccessDate,
  updateVersion,
  updateVersionComment,
};

const usecases = injectDependencies(usecasesWithoutInjectedDependencies, dependencies, boundedContext);

/**
 * @typedef {dependencies} dependencies
 */
export { usecases };
