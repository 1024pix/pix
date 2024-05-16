import Controller from '@ember/controller';
import { action } from '@ember/object';
import fetch from 'fetch';

export default class ErrorController extends Controller {
  @action
  async disconnectOidcProviderSession() {
    const response = await fetch(this.disconnectAndRetryUrl);

    const { redirectLogoutUrl } = await response.json();

    window.location.replace(redirectLogoutUrl);
  }
}
