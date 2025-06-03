import Model, { attr } from '@ember-data/model';

export default class ExternalUser extends Model {
  // attributes
  @attr('date-only') birthdate;
  @attr('number') organizationId;
  @attr('string') externalUserToken;
  @attr('string') accessToken;
}
