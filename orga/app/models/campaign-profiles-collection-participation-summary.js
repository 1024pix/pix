import Model, { attr } from '@warp-drive/legacy/model';

export default class CampaignProfilesCollectionParticipationSummary extends Model {
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('string') participantExternalId;
  @attr('date') sharedAt;
  @attr('number') pixScore;
  @attr('number') sharedProfileCount;
  @attr('nullable-string') evolution;
  @attr('boolean') certifiable;
  @attr('number') certifiableCompetencesCount;
}
