import Model, { attr } from '@ember-data/model';

export default class CampaignParticipantActivity extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') participantExternalId;
  @attr('string') status;
  @attr('string') lastSharedOrCurrentCampaignParticipationId;
}
