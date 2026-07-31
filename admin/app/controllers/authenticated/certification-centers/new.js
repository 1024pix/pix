import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class NewController extends Controller {
  @service router;

  queryParams = ['attachedOrganizationId'];

  @action
  goBackToCertificationCentersList() {
    this.router.transitionTo('authenticated.certification-centers');
  }
}
