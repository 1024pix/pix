import { service } from '@ember/service';

import ApplicationAdapter from './application';

export default class AuthenticationMethod extends ApplicationAdapter {
  @service currentUser;

  namespace = `api/users/${this.currentUser.user.id}`;
}
