import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class TermsOfServiceOidcController extends Controller {
  queryParams = ['authenticationKey', 'identityProviderSlug'];

  @tracked authenticationKey = null;
  @tracked identityProviderSlug = null;
  @service featureToggles;
}
