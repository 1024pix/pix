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
  @attr() organizationId;
  @attr('string') organizationName;
  @attr('string') organizationType;
  @attr('string') organizationLogoUrl;
  @attr() identityProvider;
  @attr('boolean') organizationShowNPS;
  @attr('string') organizationFormNPSUrl;
  @attr('string') targetProfileName;
  @attr('string') targetProfileImageUrl;
  @attr('string') customResultPageText;
  @attr('string') customResultPageButtonText;
  @attr('string') customResultPageButtonUrl;
  @attr('boolean') multipleSendings;
  @attr('boolean') isFlash;

  get isAssessment() {
    return this.type === 'ASSESSMENT';
  }

  get isProfilesCollection() {
    return this.type === 'PROFILES_COLLECTION';
  }

  get isOrganizationSCO() {
    return this.organizationType === 'SCO';
  }

  get isOrganizationSUP() {
    return this.organizationType === 'SUP';
  }

  isRestrictedByIdentityProvider(identityProviderCode) {
    return this.identityProvider === identityProviderCode;
  }
}
