import Model, { attr } from '@ember-data/model';

export default class AuthenticationMethod extends Model {
  @attr() identityProvider;
  @attr() authenticationComplement;
}
