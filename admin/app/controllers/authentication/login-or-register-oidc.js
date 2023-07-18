import Controller from '@ember/controller';

export default class LoginOrRegisterOidcController extends Controller {
  queryParams = ['authenticationKey', 'identityProviderSlug', 'givenName', 'familyName'];
}
