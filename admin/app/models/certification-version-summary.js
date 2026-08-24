import Model, { attr } from '@warp-drive/legacy/model';

export default class CertificationVersionSummary extends Model {
  @attr('date') startDate;
  @attr('date') expirationDate;
  @attr('number') assessmentDuration;
  @attr('number') maximumAssessmentLength;
  @attr('string') status;

  get isActive() {
    return this.status === 'active';
  }

  get isDraft() {
    return this.status === 'draft';
  }

  get isArchived() {
    return this.status === 'archived';
  }
}
