import Model, { attr } from '@ember-data/model';

export default class FrontendContext extends Model {
  @attr() featureToggles;
  @attr() identityProviders;
}
