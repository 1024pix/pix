/**
 * @typedef {import('./index.js').AssessmentRepository} AssessmentRepository
 * @typedef {import('./index.js').CandidateRepository} CandidateRepository
 * @typedef {import('./index.js').CertificationCourseRepository} CertificationCourseRepository
 * @typedef {import('./index.js').CertificationCourseInfoRepository} CertificationCourseInfoRepository
 * @typedef {import('./index.js').AssessmentSheetRepository} AssessmentSheetRepository
 * @typedef {import('./index.js').SessionRepository} SessionRepository
 * @typedef {import('./index.js').VersionApi} VersionApi
 * @typedef {import('./index.js').CandidateAuthorizationAdapter} CandidateAuthorizationAdapter
 * @typedef {import('./index.js').SessionAdapter} SessionAdapter
 * @typedef {import('./index.js').CertificationBadgesService} CertificationBadgesService
 * @typedef {import('./index.js').VerifyCertificateCodeService} VerifyCertificateCodeService
 */
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { LanguageNotSupportedError, UnexpectedUserAccountError } from '../../../../shared/domain/errors.js';
import { Assessment } from '../../../../shared/domain/models/Assessment.js';
import { ComplementaryCertificationCourse } from '../../../session-management/domain/models/ComplementaryCertificationCourse.js';
import { AlgorithmEngineVersion } from '../../../shared/domain/models/AlgorithmEngineVersion.js';
import { CertificationCourse } from '../../../shared/domain/models/CertificationCourse.js';
import { ComplementaryCertificationKeys } from '../../../shared/domain/models/ComplementaryCertificationKeys.js';
import { Frameworks } from '../../../shared/domain/models/Frameworks.js';
import { CertificationDurationExceededError } from '../errors.js';

const DEFAULT_LOCALE = 'fr-fr';

/**
 * @param {object} params
 * @param {string} params.locale
 * @param {AssessmentRepository} params.assessmentRepository
 * @param {CandidateRepository} params.candidateRepository
 * @param {CertificationCourseRepository} params.certificationCourseRepository
 * @param {CertificationCourseInfoRepository} params.certificationCourseInfoRepository
 * @param {AssessmentSheetRepository} params.assessmentSheetRepository
 * @param {CandidateAuthorizationAdapter} params.candidateAuthorizationAdapter
 * @param {SessionAdapter} params.sessionAdapter
 * @param {VersionApi} params.versionApi
 * @param {CertificationBadgesService} params.certificationBadgesService
 * @param {VerifyCertificateCodeService} params.verifyCertificateCodeService
 */
export async function startOrResumeCertification({
  accessCode,
  sessionId,
  userId,
  locale = DEFAULT_LOCALE,
  clientTimezone,
  assessmentRepository,
  candidateRepository,
  certificationCourseRepository,
  certificationCourseInfoRepository,
  assessmentSheetRepository,
  candidateAuthorizationAdapter,
  sessionAdapter,
  versionApi,
  certificationBadgesService,
  verifyCertificateCodeService,
}) {
  const candidateAuthorization = await candidateAuthorizationAdapter.find({ userId, sessionId });
  if (!candidateAuthorization) {
    throw new UnexpectedUserAccountError({});
  }
  candidateAuthorization.verifyCanStartOrResumeCertification(accessCode);
  if (candidateAuthorization.hasExceededCertificationDuration) {
    await endCertification({ certificationId: candidateAuthorization.certificationId, assessmentSheetRepository });
  }

  const existingCertificationCourseInfo = await certificationCourseInfoRepository.findByUserIdAndSessionId({
    userId,
    sessionId,
  });
  if (existingCertificationCourseInfo) {
    await sessionAdapter.onCertificationStartedOrResumed({
      certificationId: existingCertificationCourseInfo.id,
      sessionId,
      candidateId: existingCertificationCourseInfo.candidateId,
      timezone: clientTimezone,
    });
    return {
      hasResumed: true,
      certificationCourseInfo: existingCertificationCourseInfo,
    };
  }

  const certificationVersion = await versionApi.getByFrameworkAndDate({
    framework: candidateAuthorization.subscription,
    date: candidateAuthorization.reconciledAt,
  });

  return _startNewCertification({
    sessionId,
    userId,
    locale,
    certificationVersion,
    candidateAuthorization,
    sessionAdapter,
    assessmentRepository,
    certificationCourseRepository,
    certificationCourseInfoRepository,
    candidateRepository,
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

/**
 * @param {object} params
 * @param {number} params.certificationId
 * @param {AssessmentSheetRepository} params.assessmentSheetRepository
 */
async function endCertification({ certificationId, assessmentSheetRepository }) {
  const assessmentSheet = await assessmentSheetRepository.findByCertificationCourseId(certificationId);
  assessmentSheet.endDueToCertificationDurationExceeded();
  await assessmentSheetRepository.update(assessmentSheet);
  throw new CertificationDurationExceededError();
}

/**
 * @param {object} params
 * @param {number} params.sessionId
 * @param {string} params.locale
 * @param {CandidateAuthorization} params.candidateAuthorization
 * @param {string} params.clientTimezone
 * @param {SessionAdapter} params.sessionAdapter
 * @param {CertificationCourseRepository} params.certificationCourseRepository
 * @param {CertificationCourseInfoRepository} params.certificationCourseInfoRepository
 * @param {CertificationBadgesService} params.certificationBadgesService
 * @param {AssessmentRepository} params.assessmentRepository
 * @param {CandidateRepository} params.candidateRepository
 * @param {VerifyCertificateCodeService} params.verifyCertificateCodeService
 */
async function _startNewCertification({
  sessionId,
  userId,
  certificationVersion,
  candidateAuthorization,
  sessionAdapter,
  assessmentRepository,
  certificationCourseRepository,
  certificationCourseInfoRepository,
  candidateRepository,
  certificationBadgesService,
  verifyCertificateCodeService,
  locale,
  clientTimezone,
}) {
  _validateUserLocale(locale);

  let complementaryCertificationCourseData;
  let framework = candidateAuthorization.subscription;

  if (framework === Frameworks.CLEA) {
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

  return _createCertificationCourse({
    sessionId,
    candidateRepository,
    certificationVersion,
    sessionAdapter,
    certificationCourseRepository,
    certificationCourseInfoRepository,
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
 * @param {object} params
 * @param {number} params.sessionId
 * @param {string} params.clientTimezone
 * @param {CertificationCourseRepository} params.certificationCourseRepository
 * @param {CertificationCourseInfoRepository} params.certificationCourseInfoRepository
 * @param {CandidateRepository} params.candidateRepository
 * @param {AssessmentRepository} params.assessmentRepository
 * @param {SessionAdapter} params.sessionAdapter
 * @param {VerifyCertificateCodeService} params.verifyCertificateCodeService
 */
async function _createCertificationCourse({
  sessionId,
  certificationVersion,
  sessionAdapter,
  certificationCourseRepository,
  certificationCourseInfoRepository,
  candidateRepository,
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

  const candidate = await candidateRepository.findByUserIdAndSessionId({ userId, sessionId });
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
    await assessmentRepository.save({ assessment: newAssessment });

    const certificationCourseInfo = await certificationCourseInfoRepository.find(savedCertificationCourse.getId());
    await sessionAdapter.onCertificationStartedOrResumed({
      certificationId: certificationCourseInfo.id,
      sessionId,
      candidateId: certificationCourseInfo.candidateId,
      timezone: clientTimezone,
    });

    return {
      hasResumed: false,
      certificationCourseInfo,
    };
  });
}
