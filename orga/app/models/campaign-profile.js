import DS from 'ember-data';
const { Model, attr, hasMany } = DS;
import { computed } from '@ember/object';

export default class CampaignProfile extends Model {
  @attr('string') firstName;

  @attr('string') lastName;

  @attr('number') campaignId;

  @attr('string') externalId;

  @attr('date') createdAt;

  @attr('date') sharedAt;

  @attr('boolean') isShared;

  @attr('number') pixScore;

  @attr('number') certifiableCompetencesCount;

  @attr('number') competencesCount;

  @attr('boolean') isCertifiable;

  @hasMany('campaignProfileCompetence') competences;

  @computed('competences')
  get sortedCompetences() {
    return this.competences.sortBy('index');
  }
}
