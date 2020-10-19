import Model, { attr } from '@ember-data/model';

export default class ExternalUserAuthenticationRequest extends Model {

  @attr() username;
  @attr() password;
  @attr() externalUserToken;
  @attr() expectedUserId;
  @attr() accessToken;
}
