/**
 * @typedef {import('../../domain/models/Version.js').Version} Version
 * @typedef {import ('./index.js').VersionRepository} VersionRepository
 */

import { NotFoundError } from '../../../../shared/domain/errors.js';

/**
 * @param {object} params
 * @param {number} params.id
 * @param {string} params.startDate
 * @param {number} params.assessmentDuration
 * @param {number} params.minimumAnswersRequiredForValidation
 * @param {number} params.maximumAssessmentLength
 * @param {number} params.challengesBetweenSameCompetence
 * @param {number} params.defaultProbabilityToPickChallenge
 * @param {number} params.variationPercent
 * @param {number} params.defaultCandidateCapacity
 * @param {boolean} params.limitToOneQuestionPerTube
 * @param {boolean} params.enablePassageByAllCompetences
 * @param {object} params.globalScoringConfiguration
 * @param {Array|null} params.competencesScoringConfiguration
 * @param {VersionRepository} params.versionRepository
 */
export async function updateVersion({
  id,
  startDate,
  assessmentDuration,
  minimumAnswersRequiredForValidation,
  maximumAssessmentLength,
  challengesBetweenSameCompetence,
  defaultProbabilityToPickChallenge,
  variationPercent,
  defaultCandidateCapacity,
  limitToOneQuestionPerTube,
  enablePassageByAllCompetences,
  externalCalibrationId,
  versionRepository,
  globalScoringConfiguration,
  competencesScoringConfiguration,
}) {
  const version = await versionRepository.getById({ id });

  if (!version) {
    throw new NotFoundError(`No certification version found for id: ${id}`);
  }

  version.update({
    startDate,
    assessmentDuration,
    minimumAnswersRequiredForValidation,
    maximumAssessmentLength,
    challengesBetweenSameCompetence,
    defaultProbabilityToPickChallenge,
    variationPercent,
    defaultCandidateCapacity,
    limitToOneQuestionPerTube,
    enablePassageByAllCompetences,
    externalCalibrationId,
    globalScoringConfiguration,
    competencesScoringConfiguration,
  });

  return versionRepository.save(version);
}
