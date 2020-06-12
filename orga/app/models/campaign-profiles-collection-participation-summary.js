import DS from 'ember-data';

const { Model, attr } = DS;

export default class CampaignProfilesCollectionParticipationSummary extends Model {
  @attr('string')
  firstName;

  @attr('string')
  lastName;

  @attr('string')
  participantExternalId;

  @attr('date')
  sharedAt;

  @attr('number')
  pixScore;

  @attr('boolean')
  certifiable;

  @attr('number')
  certifiableCompetencesCount;
}

