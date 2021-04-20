import Model, { attr } from '@ember-data/model';

export default class Campaign extends Model {
  @attr('string') code;
  @attr('string') title;
  @attr('string') type;
  @attr('string') idPixLabel;
  @attr('string') customLandingPageText;
  @attr('string') externalIdHelpImageUrl;
  @attr('string') alternativeTextToExternalIdHelpImage;
  @attr('boolean') isRestricted;
  @attr('boolean') isSimplifiedAccess;
  @attr('boolean') isForAbsoluteNovice;
  @attr('boolean') isArchived;
  @attr('string') organizationName;
  @attr('string') organizationType;
  @attr('string') organizationLogoUrl;
  @attr('boolean') organizationIsPoleEmploi;
  @attr('string') targetProfileName;
  @attr('string') targetProfileImageUrl;
  @attr('string') customResultPageText;
  @attr('string') customResultPageButtonText;
  @attr('string') customResultPageButtonUrl;
  @attr('boolean') multipleSendings;

  get isAssessment() {
    return this.type === 'ASSESSMENT';
  }

  get isProfilesCollection() {
    return this.type === 'PROFILES_COLLECTION';
  }
}
