import Model, { attr } from '@ember-data/model';

export default class FlashAlgorithmConfiguration extends Model {
  @attr('number') warmUpLength;
  @attr('number') maximumAssessmentLength;
  @attr('number') challengesBetweenSameCompetence;
  @attr('number') variationPercent;
  @attr('number') variationPercentUntil;
  @attr('number') doubleMeasuresUntil;
  @attr('boolean') limitToOneQuestionPerTube;
  @attr('boolean') enablePassageByAllCompetences;
  @attr('array') forcedCompetences;
  @attr('array') minimumEstimatedSuccessRateRanges;
}
