import Model, { attr } from '@ember-data/model';

export default class CertificationInfo extends Model {
  @attr('number') assessmentDuration;
  @attr('number') minimumAssessmentLength;
  @attr('number') maximumAssessmentLength;
}
