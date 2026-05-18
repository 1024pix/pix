/**
 * @typedef {import('./index.js').AssessmentRepository} AssessmentRepository
 * @typedef {import('./index.js').CandidateRepository} CandidateRepository
 * @typedef {import('./index.js').CertificationCourseRepository} CertificationCourseRepository
 * @typedef {import('./index.js').CertificationCenterRepository} CertificationCenterRepository
 * @typedef {import('./index.js').SessionRepository} SessionRepository
 * @typedef {import('./index.js').VersionApi} VersionApi
 * @typedef {import('./index.js').CertificationBadgesService} CertificationBadgesService
 * @typedef {import('./index.js').VerifyCertificateCodeService} VerifyCertificateCodeService
 * @typedef {import('../../../shared/domain/models/CertificationCandidate.js').CertificationCandidate} CertificationCandidate
 */
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { LanguageNotSupportedError } from '../../../../shared/domain/errors.js';
import {
  CandidateNotAuthorizedToJoinSessionError,
  CandidateNotAuthorizedToResumeCertificationTestError,
  NotFoundError,
  UnexpectedUserAccountError,
} from '../../../../shared/domain/errors.js';
import { Assessment } from '../../../../shared/domain/models/Assessment.js';
import { SessionNotAccessible } from '../../../session-management/domain/errors.js';
import { ComplementaryCertificationCourse } from '../../../session-management/domain/models/ComplementaryCertificationCourse.js';
import { CenterHabilitationError } from '../../../shared/domain/errors.js';
import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';
import { CertificationCourse } from '../../../shared/domain/models/CertificationCourse.js';
import { ComplementaryCertificationKeys } from '../../../shared/domain/models/ComplementaryCertificationKeys.js';
import { Frameworks } from '../../../shared/domain/models/Frameworks.js';

const DEFAULT_LOCALE = 'fr-fr';

/**
 * @param {object} params
 * @param {string} params.locale
 * @param {AssessmentRepository} params.assessmentRepository
 * @param {CandidateRepository} params.candidateRepository
 * @param {CertificationCourseRepository} params.certificationCourseRepository
 * @param {CertificationCenterRepository} params.certificationCenterRepository
 * @param {SessionRepository} params.sessionRepository
 * @param {VersionApi} params.versionApi
 * @param {CertificationBadgesService} params.certificationBadgesService
 * @param {VerifyCertificateCodeService} params.verifyCertificateCodeService
 */
export async function retrieveLastOrCreateCertificationCourse({
  accessCode,
  sessionId,
  userId,
  locale = DEFAULT_LOCALE,
  assessmentRepository,
  candidateRepository,
  certificationCourseRepository,
  sessionRepository,
  certificationCenterRepository,
  versionApi,
  certificationBadgesService,
  verifyCertificateCodeService,
  clientTimezone,
}) {
  const session = await sessionRepository.get({ id: sessionId });
  if (session.accessCode !== accessCode) throw new NotFoundError('Session not found');
  if (session.isNotAccessible) throw new SessionNotAccessible();

  const candidate = await candidateRepository.findByUserIdAndSessionId({ userId, sessionId });
  if (!candidate) throw new UnexpectedUserAccountError({});

  const certificationVersion = await versionApi.getByFrameworkAndDate({
    framework: candidate.subscriptionFramework,
    date: candidate.reconciledAt,
  });

  const existingCertificationCourse =
    await certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId({
      userId,
      sessionId,
    });

  _validateCandidateIsAuthorizedToStart(candidate, existingCertificationCourse);

  await _preventCandidateFromRestarting(candidate, candidateRepository);

  if (existingCertificationCourse) {
    existingCertificationCourse.adjustForAccessibility(candidate.accessibilityAdjustmentNeeded);
    existingCertificationCourse.setNumberOfChallenges(
      certificationVersion.challengesConfiguration.maximumAssessmentLength,
    );

    return {
      created: false,
      certificationCourse: existingCertificationCourse,
    };
  }

  return _startNewCertification({
    session,
    userId,
    locale,
    candidate,
    certificationVersion,
    sessionRepository,
    assessmentRepository,
    certificationCourseRepository,
    certificationCenterRepository,
    verifyCertificateCodeService,
    certificationBadgesService,
    clientTimezone,
  });
}

function _validateUserLocale(userLanguage) {
  const isUserLanguageValid = CertificationCourse.isLanguageAvailableForV3Certification(userLanguage);

  if (!isUserLanguageValid) {
    throw new LanguageNotSupportedError(userLanguage);
  }
}

function _validateCandidateIsAuthorizedToStart(candidate, existingCertificationCourse) {
  if (!candidate.authorizedToStart) {
    if (existingCertificationCourse) {
      throw new CandidateNotAuthorizedToResumeCertificationTestError();
    } else {
      throw new CandidateNotAuthorizedToJoinSessionError();
    }
  }
}

async function _preventCandidateFromRestarting(candidate, candidateRepository) {
  candidate.authorizedToStart = false;
  await candidateRepository.update(candidate);
}

/**
 * @param {object} params
 * @param {Session} params.session
 * @param {string} params.locale
 * @param {Candidate} params.candidate
 * @param {string} params.clientTimezone
 * @param {CertificationCourseRepository} params.certificationCourseRepository
 * @param {CertificationCenterRepository} params.certificationCenterRepository
 * @param {CertificationBadgesService} params.certificationBadgesService
 * @param {AssessmentRepository} params.assessmentRepository
 * @param {VerifyCertificateCodeService} params.verifyCertificateCodeService
 */
async function _startNewCertification({
  session,
  userId,
  candidate,
  certificationVersion,
  sessionRepository,
  assessmentRepository,
  certificationCourseRepository,
  certificationCenterRepository,
  certificationBadgesService,
  verifyCertificateCodeService,
  locale,
  clientTimezone,
}) {
  _validateUserLocale(locale);

  const certificationCenter = await certificationCenterRepository.getBySessionId({ sessionId: session.id });

  let complementaryCertificationCourseData;
  let framework = candidate.subscriptionFramework;

  if (candidate.hasSubscribedToSomethingElseButCore) {
    if (!certificationCenter.isHabilitated(candidate.subscriptionFramework)) {
      throw new CenterHabilitationError();
    }

    if (candidate.hasSubscribedToClea) {
      const highestCertifiableBadgeAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
        userId,
      });

      const [doubleCertificationBadge] = highestCertifiableBadgeAcquisitions.filter(
        (acquiredBadge) => acquiredBadge.complementaryCertificationKey === ComplementaryCertificationKeys.CLEA,
      );

      if (doubleCertificationBadge) {
        const { complementaryCertificationId, complementaryCertificationBadgeId } = doubleCertificationBadge;
        complementaryCertificationCourseData = { complementaryCertificationBadgeId, complementaryCertificationId };
      } else {
        framework = Frameworks.CORE;
      }
    }
  }

  // Above operations are potentially slow so that two simultaneous calls of this function might overlap 😿
  // In case the simultaneous call finished earlier than the current one, we want to return its result
  const certificationCourseCreatedMeanwhile = await _getCertificationCourseIfCreatedMeanwhile(
    certificationCourseRepository,
    userId,
    session.id,
  );
  if (certificationCourseCreatedMeanwhile) {
    return {
      created: false,
      certificationCourse: certificationCourseCreatedMeanwhile,
    };
  }

  return _createCertificationCourse({
    session,
    candidate,
    certificationVersion,
    sessionRepository,
    certificationCourseRepository,
    assessmentRepository,
    userId,
    verifyCertificateCodeService,
    complementaryCertificationCourseData,
    lang: locale,
    framework,
    clientTimezone,
  });
}

/**
 * @param {CertificationCourseRepository} certificationCourseRepository
 * @param {number} userId
 * @param {number} sessionId
 * @returns {Promise<CertificationCourse>}
 */
function _getCertificationCourseIfCreatedMeanwhile(certificationCourseRepository, userId, sessionId) {
  return certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId({
    userId,
    sessionId,
  });
}

/**
 * @param {object} params
 * @param {string} params.clientTimezone
 * @param {CertificationCourseRepository} params.certificationCourseRepository
 * @param {AssessmentRepository} params.assessmentRepository
 * @param {VerifyCertificateCodeService} params.verifyCertificateCodeService
 */
async function _createCertificationCourse({
  session,
  candidate,
  certificationVersion,
  sessionRepository,
  certificationCourseRepository,
  assessmentRepository,
  verifyCertificateCodeService,
  userId,
  complementaryCertificationCourseData,
  lang,
  framework,
  clientTimezone,
}) {
  const verificationCode = await verifyCertificateCodeService.generateCertificateVerificationCode();
  const complementaryCertificationCourse = complementaryCertificationCourseData
    ? new ComplementaryCertificationCourse({
        complementaryCertificationBadgeId: complementaryCertificationCourseData.complementaryCertificationBadgeId,
        complementaryCertificationId: complementaryCertificationCourseData.complementaryCertificationId,
      })
    : null;

  const newCertificationCourse = CertificationCourse.from({
    candidate,
    certificationVersion,
    complementaryCertificationCourse,
    verificationCode,
    algorithmEngineVersion: AlgorithmEngineVersion.V3,
    lang,
    framework,
  });

  return DomainTransaction.execute(async () => {
    const savedCertificationCourse = await certificationCourseRepository.save({
      certificationCourse: newCertificationCourse,
    });

    const newAssessment = Assessment.createForCertificationCourse({
      userId,
      certificationCourseId: savedCertificationCourse.getId(),
    });
    const savedAssessment = await assessmentRepository.save({ assessment: newAssessment });

    const certificationCourse = savedCertificationCourse.withAssessment(savedAssessment);
    certificationCourse.setNumberOfChallenges(certificationVersion.challengesConfiguration.maximumAssessmentLength);

    if (!session.hasStarted) {
      session.setStartDate(clientTimezone);
      await sessionRepository.update(session);
    }

    return {
      created: true,
      certificationCourse,
    };
  });
}
