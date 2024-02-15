import Model, { hasMany, attr } from '@ember-data/model';

export default class CampaignProfile extends Model {
  @attr('string') firstName;

  @attr('string') lastName;

  @attr('number') campaignId;

  @attr('number') organizationLearnerId;

  @attr('string') externalId;

  @attr('date') createdAt;

  @attr('date') sharedAt;

  @attr('boolean') isShared;

  @attr('number') pixScore;

  @attr('number') certifiableCompetencesCount;

  @attr('number') competencesCount;

  @attr('boolean') isCertifiable;

  @hasMany('campaignProfileCompetence') competences;

  get sortedCompetences() {
    return this.competences.sortBy('index');
  }
}
