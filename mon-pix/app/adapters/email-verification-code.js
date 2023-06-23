import ApplicationAdapter from './application';
import { service } from '@ember/service';

export default class EmailVerificationCodeAdapter extends ApplicationAdapter {
  @service currentUser;

  buildURL() {
    const userId = this.currentUser.user.get('id');
    return `${this.host}/${this.namespace}/users/${userId}`;
  }
}
