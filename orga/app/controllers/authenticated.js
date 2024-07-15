import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';

export default class AuthenticatedController extends Controller {
  @service currentUser;
  @service store;

  @action
  refreshAuthenticatedModel() {
    console.log('in refreshAuthenticatedModel controller')
    console.log('this.actions',this.actions)
    console.log('this.target',this.target)
    this.send('refreshModel');
  }
}
