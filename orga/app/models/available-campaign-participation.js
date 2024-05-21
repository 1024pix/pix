import Model, { attr } from '@ember-data/model';

export default class availableCampaignParticipation extends Model {
  @attr('date') sharedAt;
  @attr('string') status;
}
