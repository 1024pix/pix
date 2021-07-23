import Model, { attr } from '@ember-data/model';

export default class Campaign extends Model {
  @attr('string') name;
  @attr('date') archivedAt;
  @attr('string') type;
  @attr('string') code;
  @attr('date') createdAt;
  @attr('string') creatorLastName;
  @attr('string') creatorFirstName;
  @attr('string') organizationId;
  @attr('string') organizationName;
  @attr('string') targetProfileId;
  @attr('string') targetProfileName;

  get isTypeProfilesCollection() {
    return this.type === 'PROFILES_COLLECTION';
  }

  get isTypeAssessment() {
    return this.type === 'ASSESSMENT';
  }
}
