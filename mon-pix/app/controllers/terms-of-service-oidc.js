import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class TermsOfServiceOidcController extends Controller {
  queryParams = ['authenticationKey', 'identityProviderName'];

  @tracked authenticationKey = null;
  @tracked identityProviderName = null;
}
