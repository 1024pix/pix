import Model, { attr } from '@ember-data/model';
export default class Campaign extends Model {
  @attr('nullable-string') name;
  @attr('nullable-string') title;
  @attr('date') archivedAt;
  @attr('nullable-string') type;
  @attr('string') code;
  @attr('nullable-string') idPixLabel;
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
  @attr('boolean') isTypeAssessment;
  @attr('boolean') multipleSendings;
}
