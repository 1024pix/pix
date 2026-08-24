import Model, { attr } from '@warp-drive/legacy/model';

export default class CertificationInfo extends Model {
  @attr('number') assessmentDuration;
  @attr('number') minimumAssessmentLength;
  @attr('number') maximumAssessmentLength;
}
