import Model, { attr } from '@warp-drive/legacy/model';

export default class Campaign extends Model {
  @attr('string') code;
  @attr('string') title;
  @attr('string') type;
  @attr('string') externalIdLabel;
  @attr('string') externaIdType;
  @attr('string') customLandingPageText;
  @attr('string') externalIdHelpImageUrl;
  @attr('string') alternativeTextToExternalIdHelpImage;
  @attr('boolean') isRestricted;
  @attr('boolean') isSimplifiedAccess;
  @attr('boolean') isForAbsoluteNovice;
  @attr('boolean') isAccessible;
  // eslint-disable-next-line ember/no-empty-attrs
  @attr() organizationId;
  @attr('string') organizationName;
  @attr('string') organizationType;
  @attr('string') organizationLogoUrl;
  // eslint-disable-next-line ember/no-empty-attrs
  @attr() identityProvider;
  @attr('boolean') organizationShowNPS;
  @attr('string') organizationFormNPSUrl;
  @attr('string') targetProfileName;
  @attr('string') targetProfileImageUrl;
  @attr('string') customResultPageText;
  @attr('string') customResultPageButtonText;
  @attr('string') customResultPageButtonUrl;
  @attr('boolean') multipleSendings;
  @attr('boolean') recommendationEngine;

  @attr('boolean') isReconciliationRequired;
  // eslint-disable-next-line ember/no-empty-attrs
  @attr() reconciliationFields;

  get isAssessment() {
    return this.type === 'ASSESSMENT';
  }

  get isProfilesCollection() {
    return this.type === 'PROFILES_COLLECTION';
  }

  get isExam() {
    return this.type === 'EXAM';
  }

  get isOrganizationSCO() {
    return this.organizationType === 'SCO';
  }

  get isOrganizationSUP() {
    return this.organizationType === 'SUP';
  }

  get hasCustomResultPageButton() {
    return Boolean(this.customResultPageButtonUrl) && Boolean(this.customResultPageButtonText);
  }

  get isPartOfCombinedCourse() {
    if (!this.customResultPageButtonUrl) {
      return false;
    }
    return this.customResultPageButtonUrl.includes('/parcours/');
  }
}
