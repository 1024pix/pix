import Model, { attr, hasMany } from '@warp-drive/legacy/model';

export default class CertificationVersion extends Model {
  @attr('date') startDate;
  @attr('date') expirationDate;
  @attr('number') assessmentDuration;
  @attr('number') minimumAnswersRequiredForValidation;
  @attr('number') maximumAssessmentLength;
  @attr('number') challengesBetweenSameCompetence;
  @attr('number') defaultProbabilityToPickChallenge;
  @attr('number') variationPercent;
  @attr('number') defaultCandidateCapacity;
  @attr('boolean') limitToOneQuestionPerTube;
  @attr('boolean') enablePassageByAllCompetences;
  @attr('string') status;
  @attr('string') scope;
  @attr('string') comments;
  @attr('number') externalCalibrationId;
  @attr() globalScoringConfiguration;
  @attr() competencesScoringConfiguration;

  @hasMany('area', { async: false, inverse: null }) areas;

  get hasExternalCalibrationId() {
    return !!this.externalCalibrationId;
  }

  get isDraft() {
    return this.status === 'draft';
  }

  get isActive() {
    return this.status === 'active';
  }

  get isCoreScope() {
    return this.scope === 'CORE';
  }
}
