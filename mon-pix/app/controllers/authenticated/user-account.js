import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class UserAccountController extends Controller {
  @service currentDomain;

  get isInternationalDomain() {
    return !this.currentDomain.isFranceDomain;
  }
}
