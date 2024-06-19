import Model, { attr, hasMany } from '@ember-data/model';

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

  @hasMany('campaign-profile-competence', { async: true, inverse: null }) competences;

  get sortedCompetences() {
    const competences = this.hasMany('competences').value();

    if (competences === null) return [];

    return competences.slice().sort((a, b) => {
      return a.index.localeCompare(b.index);
    });
  }
}
