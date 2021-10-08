import ApplicationAdapter from './application';
import { inject as service } from '@ember/service';

export default class AuthenticationMethod extends ApplicationAdapter {
  @service currentUser;

  namespace = `api/users/${this.currentUser.user.id}`;
}
