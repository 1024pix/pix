import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class LoginController extends Controller {
  @service featureToggles;

  get isNewAuthenticationDesignEnabled() {
    return this.featureToggles.featureToggles.isNewAuthenticationDesignEnabled;
  }
}
