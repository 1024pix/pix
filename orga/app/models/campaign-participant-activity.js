import Model, { attr } from '@warp-drive/legacy/model';

export default class CampaignParticipantActivity extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') participantExternalId;
  @attr('string') status;
  @attr('number') lastCampaignParticipationId;
  @attr('number') participationCount;
}
