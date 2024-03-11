import { service } from '@ember/service';

import ApplicationAdapter from './application';

export default class EmailVerificationCodeAdapter extends ApplicationAdapter {
  @service currentUser;

  buildURL() {
    const userId = this.currentUser.user.get('id');
    return `${this.host}/${this.namespace}/users/${userId}`;
  }
}
