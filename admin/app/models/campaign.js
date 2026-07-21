import Model, { attr } from '@warp-drive/legacy/model';
export default class Campaign extends Model {
  @attr('nullable-string') name;
  @attr('nullable-string') title;
  @attr('date') archivedAt;
  @attr('date') deletedAt;
  @attr('nullable-string') type;
  @attr('string') code;
  @attr('nullable-string') externalIdLabel;
  @attr('date') createdAt;
  @attr('string') creatorLastName;
  @attr('string') creatorFirstName;
  @attr('string') ownerLastName;
  @attr('string') ownerFirstName;
  @attr('string') organizationId;
  @attr('string') organizationName;
  @attr('string') targetProfileId;
  @attr('string') targetProfileName;
  @attr('nullable-text') customLandingPageText;
  @attr('nullable-text') customResultPageText;
  @attr('nullable-string') customResultPageButtonText;
  @attr('nullable-string') customResultPageButtonUrl;
  @attr('number') sharedParticipationsCount;
  @attr('number') totalParticipationsCount;
  @attr('boolean') isTypeProfilesCollection;
  @attr('boolean') isForAbsoluteNovice;
  @attr('boolean') multipleSendings;

  get isProfilesCollection() {
    return this.type === 'PROFILES_COLLECTION';
  }

  get isTypeAssessment() {
    return this.type === 'ASSESSMENT';
  }

  get isTypeExam() {
    return this.type === 'EXAM';
  }
}
