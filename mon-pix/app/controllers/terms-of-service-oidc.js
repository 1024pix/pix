import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class TermsOfServiceOidcController extends Controller {
  queryParams = ['authenticationKey', 'identityProviderSlug'];

  @tracked authenticationKey = null;
  @tracked identityProviderSlug = null;
}
