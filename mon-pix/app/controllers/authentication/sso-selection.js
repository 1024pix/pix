import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

const SIGNIN_ROUTE = 'authentication';

export default class SsoSelectionController extends Controller {
  @service router;

  @action
  goBack() {
    this.router.transitionTo(this.parentRouteName);
  }

  get parentRouteName() {
    return this.router.currentRoute?.parent?.name ?? SIGNIN_ROUTE;
  }

  get isSigninRoute() {
    return this.parentRouteName === SIGNIN_ROUTE;
  }
}
