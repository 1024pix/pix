import { service } from '@ember/service';

import ApplicationAdapter from './application';

export default class AttestationDetail extends ApplicationAdapter {
  @service currentUser;

  namespace = `api/users/${this.currentUser.user.id}`;

  urlForFindAll() {
    return `${this.host}/${this.namespace}/attestation-details`;
  }
}
