import Controller from '@ember/controller';
import { service } from '@ember/service';

export default class UserAccountController extends Controller {
  @service currentDomain;

  get isInternationalDomain() {
    return !this.currentDomain.isFranceDomain;
  }
}
