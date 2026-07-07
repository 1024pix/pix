import { VersionDetails } from '../../../../../../src/certification/configuration/domain/read-models/VersionDetails.js';

export function buildVersionDetails({
  id,
  startDate,
  expirationDate,
  assessmentDuration,
  minimumAnswersRequiredForValidation,
  maximumAssessmentLength,
  challengesBetweenSameCompetence,
  defaultProbabilityToPickChallenge,
  defaultCandidateCapacity,
  variationPercent,
  limitToOneQuestionPerTube,
  enablePassageByAllCompetences,
  scope,
  status,
  comments,
  areas,
}) {
  return new VersionDetails({
    id,
    startDate,
    expirationDate,
    assessmentDuration,
    minimumAnswersRequiredForValidation,
    maximumAssessmentLength,
    challengesBetweenSameCompetence,
    defaultProbabilityToPickChallenge,
    defaultCandidateCapacity,
    variationPercent,
    limitToOneQuestionPerTube,
    enablePassageByAllCompetences,
    scope,
    status,
    comments,
    areas,
  });
}
