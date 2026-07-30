import Model, { attr } from '@warp-drive/legacy/model';

export default class availableCampaignParticipation extends Model {
  @attr('date') sharedAt;
  @attr('string') status;
}
