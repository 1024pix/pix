export class VersionDetails {
  constructor({
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
    externalCalibrationId,
    globalScoringConfiguration,
    scope,
    status,
    comments,
    areas,
  }) {
    this.id = id;
    this.startDate = startDate;
    this.expirationDate = expirationDate;
    this.assessmentDuration = assessmentDuration;
    this.minimumAnswersRequiredForValidation = minimumAnswersRequiredForValidation;
    this.maximumAssessmentLength = maximumAssessmentLength;
    this.challengesBetweenSameCompetence = challengesBetweenSameCompetence;
    this.defaultProbabilityToPickChallenge = defaultProbabilityToPickChallenge;
    this.defaultCandidateCapacity = defaultCandidateCapacity;
    this.variationPercent = variationPercent;
    this.limitToOneQuestionPerTube = limitToOneQuestionPerTube;
    this.enablePassageByAllCompetences = enablePassageByAllCompetences;
    this.externalCalibrationId = externalCalibrationId;
    this.globalScoringConfiguration = globalScoringConfiguration;
    this.scope = scope;
    this.status = status;
    this.comments = comments;
    this.areas = areas;
  }
}
