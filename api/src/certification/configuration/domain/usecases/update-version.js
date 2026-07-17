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
  versionRepository,
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
  });

  return versionRepository.save(version);
}
