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

}

