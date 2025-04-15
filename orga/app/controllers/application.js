import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class ApplicationController extends Controller {
  @service router;

  get isAuthenticatedRoute() {
    return this.router.currentRouteName.startsWith('authenticated.');
  }

  @action
  onChangeOrganization() {
    this.send('refreshAuthenticatedModel');
  }
}
