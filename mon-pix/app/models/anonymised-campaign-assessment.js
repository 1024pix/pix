import Model, { attr } from '@warp-drive/legacy/model';

export default class AnonymisedCampaignAssessment extends Model {
  @attr('string') state;
  @attr('date') updatedAt;

  get cardStatus() {
    return 'DELETED';
  }
}
