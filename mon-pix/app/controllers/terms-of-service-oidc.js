import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class TermsOfServiceOidcController extends Controller {
  queryParams = ['authenticationKey', 'identityProviderSlug'];

  @tracked showOidcReconciliation = false;
  @tracked authenticationKey = null;
  @tracked identityProviderSlug = null;

  @service featureToggles;

  @action toggleOidcReconciliation() {
    this.showOidcReconciliation = !this.showOidcReconciliation;
  }
}
