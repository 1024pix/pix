import Model, { attr } from '@ember-data/model';

export default class ExternalUser extends Model {
  // attributes
  @attr('date-only') birthdate;
  @attr('string') campaignCode;
  @attr('string') externalUserToken;
  @attr('string') accessToken;
}
