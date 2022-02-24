import Model, { attr } from '@ember-data/model';

export default class Campaign extends Model {
  @attr('string') name;
  @attr('string') title;
  @attr('date') archivedAt;
  @attr('string') type;
  @attr('string') code;
  @attr('string') idPixLabel;
  @attr('date') createdAt;
  @attr('string') creatorLastName;
  @attr('string') creatorFirstName;
  @attr('string') ownerLastName;
  @attr('string') ownerFirstName;
  @attr('string') organizationId;
  @attr('string') organizationName;
  @attr('string') targetProfileId;
  @attr('string') targetProfileName;
  @attr('string') customLandingPageText;
  @attr('string') customResultPageText;
  @attr('string') customResultPageButtonText;
  @attr('string') customResultPageButtonUrl;

  get isTypeProfilesCollection() {
    return this.type === 'PROFILES_COLLECTION';
  }

  get isTypeAssessment() {
    return this.type === 'ASSESSMENT';
  }
}
