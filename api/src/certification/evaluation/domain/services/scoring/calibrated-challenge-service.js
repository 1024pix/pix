//@ts-check
/**
 * @typedef {import('../index.js').ChallengeCalibrationRepository} ChallengeCalibrationRepository
 * @typedef {import('../index.js').CertificationChallengeLiveAlertRepository} CertificationChallengeLiveAlertRepository
 * @typedef {import('../index.js').CertificationCourseRepository} CertificationCourseRepository
 * @typedef {import('../index.js').SharedChallengeRepository} SharedChallengeRepository
 * @typedef {import('../index.js').CalibratedChallengeRepository} CalibratedChallengeRepository
 * @typedef {import('../../../../../shared/domain/models/Challenge.js').Challenge} Challenge
 * @typedef {import('../../../../scoring/domain/read-models/ChallengeCalibration.js').ChallengeCalibration} ChallengeCalibration
 * @typedef {import('../../../../shared/domain/models/Version.js').Version} Version
 * @typedef {import('../../../../shared/domain/models/CertificationCourse.js').CertificationCourse} CertificationCourse
 * @typedef {import('../../models/CalibratedChallenge.js').CalibratedChallenge} CalibratedChallenge
 */
/**
 * @typedef {object} FindByCertificationCourseAndVersionResult
 * @property {Array<CalibratedChallenge>} allChallenges - All calibrated challenges for the version no matter the locale
 * @property {Array<CalibratedChallenge>} askedChallengesWithoutLiveAlerts - Calibrated challenges presented to the candidate, excluding those with validated live alerts.
 * @property {Array<ChallengeCalibration>} challengeCalibrationsWithoutLiveAlerts - Calibrations of challenges presented to the candidate, excluding those with validated live alerts.
 */
import { withTransaction } from '../../../../../shared/domain/DomainTransaction.js';

export const findByCertificationCourseAndVersion = withTransaction(
  /**
   * @param {object} params
   * @param {number} params.certificationCourseId
   * @param {number} params.assessmentId
   * @param {Version} params.version
   * @param {ChallengeCalibrationRepository} params.challengeCalibrationRepository
   * @param {CertificationChallengeLiveAlertRepository} params.certificationChallengeLiveAlertRepository
   * @param {CalibratedChallengeRepository} params.calibratedChallengeRepository
   * @returns {Promise<FindByCertificationCourseAndVersionResult>}
   */
  async ({
    certificationCourseId,
    assessmentId,
    version,
    challengeCalibrationRepository,
    certificationChallengeLiveAlertRepository,
    calibratedChallengeRepository,
  }) => {
    const calibratedChallenges = await calibratedChallengeRepository.getAllCalibratedChallenges({ version });

    const { allChallenges, askedChallenges, challengesCalibrations } = await _findByCertificationCourseId({
      compatibleChallenges: calibratedChallenges,
      certificationCourseId,
      challengeCalibrationRepository,
    });

    const { challengeCalibrationsWithoutLiveAlerts, askedChallengesWithoutLiveAlerts } =
      await _removeChallengesWithValidatedLiveAlerts(
        challengesCalibrations,
        assessmentId,
        askedChallenges,
        certificationChallengeLiveAlertRepository,
      );

    return { allChallenges, askedChallengesWithoutLiveAlerts, challengeCalibrationsWithoutLiveAlerts };
  },
);

/**
 * @typedef {object} FindByCertificationCourseIdObject
 * @property {Array<CalibratedChallenge>} allChallenges - all challenges data + calibration for this version
 * @property {Array<CalibratedChallenge>} askedChallenges - all challenges data + calibrations PRESENTED to candidate
 * @property {Array<ChallengeCalibration>} challengesCalibrations - only calibrations of challenges PRESENTED to candidate
 */

/**
 * @param {object} params
 * @param {Array<CalibratedChallenge>} params.compatibleChallenges
 * @param {number} params.certificationCourseId
 * @param {ChallengeCalibrationRepository} params.challengeCalibrationRepository
 * @returns {Promise<FindByCertificationCourseIdObject>}
 */
const _findByCertificationCourseId = async ({
  compatibleChallenges,
  certificationCourseId,
  challengeCalibrationRepository,
}) => {
  const challengesCalibrations = await challengeCalibrationRepository.getByCertificationCourseId({
    certificationCourseId,
  });

  const askedChallenges = compatibleChallenges.filter((challenge) => {
    return challengesCalibrations.find((calibration) => challenge.id === calibration.id);
  });
  return { allChallenges: compatibleChallenges, askedChallenges, challengesCalibrations };
};

/**
 * @param {Array<ChallengeCalibration>} challengesCalibrations - only calibrations of challenges PRESENTED to candidate
 * @param {number} assessmentId
 * @param {Array<CalibratedChallenge>} askedChallenges - all challenges data + calibrations PRESENTED to candidate
 * @param {CertificationChallengeLiveAlertRepository} certificationChallengeLiveAlertRepository
 */
async function _removeChallengesWithValidatedLiveAlerts(
  challengesCalibrations,
  assessmentId,
  askedChallenges,
  certificationChallengeLiveAlertRepository,
) {
  const validatedLiveAlertChallengeIds =
    await certificationChallengeLiveAlertRepository.getLiveAlertValidatedChallengeIdsByAssessmentId({
      assessmentId,
    });
  const challengeCalibrationsWithoutLiveAlerts = challengesCalibrations.filter(
    (challengeCalibration) => !validatedLiveAlertChallengeIds.includes(challengeCalibration.id),
  );
  const askedChallengesWithoutLiveAlerts = askedChallenges.filter(
    (askedChallenge) => !validatedLiveAlertChallengeIds.includes(askedChallenge.id),
  );
  return { challengeCalibrationsWithoutLiveAlerts, askedChallengesWithoutLiveAlerts };
}
