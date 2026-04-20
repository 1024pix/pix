/**
 * @typedef {import('./index.js').AssessmentRepository} AssessmentRepository
 * @typedef {import('./index.js').CertificationCandidateRepository} CertificationCandidateRepository
 * @typedef {import('./index.js').CertificationCourseRepository} CertificationCourseRepository
 * @typedef {import('./index.js').CertificationCenterRepository} CertificationCenterRepository
 * @typedef {import('./index.js').EvaluationSessionRepository} EvaluationSessionRepository
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
import { SCOPES } from '../../../shared/domain/models/Scopes.js';

const DEFAULT_LOCALE = 'fr-fr';

/**
 * @param {object} params
 * @param {string} params.locale
 * @param {AssessmentRepository} params.assessmentRepository
 * @param {CertificationCandidateRepository} params.sharedCertificationCandidateRepository
 * @param {CertificationCourseRepository} params.certificationCourseRepository
 * @param {CertificationCenterRepository} params.certificationCenterRepository
 * @param {EvaluationSessionRepository} params.evaluationSessionRepository
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
  sharedCertificationCandidateRepository,
  certificationCourseRepository,
  evaluationSessionRepository,
  certificationCenterRepository,
  versionApi,
  certificationBadgesService,
  verifyCertificateCodeService,
}) {
  const session = await evaluationSessionRepository.get({ id: sessionId });

  _validateSessionAccess(session, accessCode);
  _validateSessionIsActive(session);

  const certificationCandidate = await sharedCertificationCandidateRepository.getBySessionIdAndUserId({
    userId,
    sessionId,
  }); // normal candidate repo, voir où c'est utilisé

  _validateUserIsCertificationCandidate(certificationCandidate);

  const certificationScope = certificationCandidate.isEnrolledToComplementaryOnly()
    ? certificationCandidate.complementaryCertification.key
    : SCOPES.CORE;

  const certificationVersion = await versionApi.getByFrameworkAndDate({
    framework: certificationScope,
    date: certificationCandidate.reconciledAt,
  });

  const existingCertificationCourse =
    await certificationCourseRepository.findOneCertificationCourseByUserIdAndSessionId({
      userId,
      sessionId,
    });

  _validateCandidateIsAuthorizedToStart(certificationCandidate, existingCertificationCourse);

  await _blockCandidateFromRestartingWithoutExplicitValidation(
    certificationCandidate,
    sharedCertificationCandidateRepository,
  );

  if (existingCertificationCourse) {
    existingCertificationCourse.adjustForAccessibility(certificationCandidate.accessibilityAdjustmentNeeded);
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
    certificationCandidate,
    certificationVersion,
    assessmentRepository,
    certificationCourseRepository,
    certificationCenterRepository,
    verifyCertificateCodeService,
    certificationBadgesService,
  });
}

function _validateUserLocale(userLanguage) {
  const isUserLanguageValid = CertificationCourse.isLanguageAvailableForV3Certification(userLanguage);

  if (!isUserLanguageValid) {
    throw new LanguageNotSupportedError(userLanguage);
  }
}

function _validateSessionAccess(session, accessCode) {
  if (session.accessCode !== accessCode) {
    throw new NotFoundError('Session not found');
  }
}

function _validateSessionIsActive(session) {
  if (session.isNotAccessible) {
    throw new SessionNotAccessible();
  }
}

function _validateUserIsCertificationCandidate(certificationCandidate) {
  if (!certificationCandidate) {
    throw new UnexpectedUserAccountError({});
  }
}

function _validateCandidateIsAuthorizedToStart(certificationCandidate, existingCertificationCourse) {
  if (!certificationCandidate.isAuthorizedToStart()) {
    if (existingCertificationCourse) {
      throw new CandidateNotAuthorizedToResumeCertificationTestError();
    } else {
      throw new CandidateNotAuthorizedToJoinSessionError();
    }
  }
}

async function _blockCandidateFromRestartingWithoutExplicitValidation(
  certificationCandidate,
  sharedCertificationCandidateRepository,
) {
  certificationCandidate.authorizedToStart = false;
  await sharedCertificationCandidateRepository.update(certificationCandidate);
}

/**
 * @param {object} params
 * @param {Session} params.session
 * @param {string} params.locale
 * @param {CertificationCourseRepository} params.certificationCourseRepository
 * @param {CertificationCenterRepository} params.certificationCenterRepository
 * @param {CertificationBadgesService} params.certificationBadgesService
 * @param {AssessmentRepository} params.assessmentRepository
 * @param {VerifyCertificateCodeService} params.verifyCertificateCodeService
 */
async function _startNewCertification({
  session,
  userId,
  certificationCandidate,
  certificationVersion,
  assessmentRepository,
  certificationCourseRepository,
  certificationCenterRepository,
  certificationBadgesService,
  verifyCertificateCodeService,
  locale,
}) {
  _validateUserLocale(locale);

  const certificationCenter = await certificationCenterRepository.getBySessionId({ sessionId: session.id });

  let complementaryCertificationCourseData;
  let framework = Frameworks.CORE;

  if (certificationCandidate.isEnrolledToComplementaryOnly()) {
    framework = certificationCandidate.complementaryCertification.key;
    if (!certificationCenter.isHabilitated(certificationCandidate.complementaryCertification.key)) {
      throw new CenterHabilitationError();
    }

    complementaryCertificationCourseData = {
      complementaryCertificationBadgeId: null,
      complementaryCertificationId: certificationCandidate.complementaryCertification.id,
    };
  }

  if (certificationCandidate.isEnrolledToDoubleCertification()) {
    if (!certificationCenter.isHabilitated(certificationCandidate.complementaryCertification.key)) {
      throw new CenterHabilitationError();
    }

    const highestCertifiableBadgeAcquisitions = await certificationBadgesService.findStillValidBadgeAcquisitions({
      userId,
    });

    const [doubleCertificationBadge] = highestCertifiableBadgeAcquisitions.filter(
      (acquiredBadge) => acquiredBadge.complementaryCertificationKey === ComplementaryCertificationKeys.CLEA,
    );

    if (doubleCertificationBadge) {
      framework = Frameworks.CLEA;
      const { complementaryCertificationId, complementaryCertificationBadgeId } = doubleCertificationBadge;
      complementaryCertificationCourseData = { complementaryCertificationBadgeId, complementaryCertificationId };
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
    certificationCandidate,
    certificationVersion,
    certificationCourseRepository,
    assessmentRepository,
    userId,
    verifyCertificateCodeService,
    complementaryCertificationCourseData,
    lang: locale,
    framework,
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
 * @param {CertificationCourseRepository} params.certificationCourseRepository
 * @param {AssessmentRepository} params.assessmentRepository
 * @param {VerifyCertificateCodeService} params.verifyCertificateCodeService
 */
async function _createCertificationCourse({
  certificationCandidate,
  certificationVersion,
  certificationCourseRepository,
  assessmentRepository,
  verifyCertificateCodeService,
  userId,
  complementaryCertificationCourseData,
  lang,
  framework,
}) {
  const verificationCode = await verifyCertificateCodeService.generateCertificateVerificationCode();
  const complementaryCertificationCourse = complementaryCertificationCourseData
    ? new ComplementaryCertificationCourse({
        complementaryCertificationBadgeId: complementaryCertificationCourseData.complementaryCertificationBadgeId,
        complementaryCertificationId: complementaryCertificationCourseData.complementaryCertificationId,
      })
    : null;

  const newCertificationCourse = CertificationCourse.from({
    certificationCandidate,
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

    // FIXME : return CertificationCourseCreated or CertificationCourseRetrieved with only needed fields
    return {
      created: true,
      certificationCourse,
    };
  });
}
