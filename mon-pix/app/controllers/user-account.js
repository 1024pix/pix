import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class UserAccountController extends Controller {
  @service url;
  @service currentUser;

  get displayLanguageSwitch() {
    return !this.url.isFrenchDomainExtension;
  }
}
