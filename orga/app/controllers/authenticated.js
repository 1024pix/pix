import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class AuthenticatedController extends Controller {
  @service currentUser;
  @service store;

  @action
  onChangeOrganization() {
    this.send('refreshAuthenticatedModel');
  }
}
