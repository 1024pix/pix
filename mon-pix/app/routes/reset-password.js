import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

@classic
export default class ResetPasswordRoute extends Route {
  @service session;

  async model(params) {
    const passwordResetTemporaryKey = params.temporary_key;
    const user = await this.store.queryRecord('user', { passwordResetTemporaryKey });
    return { user, temporaryKey: passwordResetTemporaryKey };
  }
}
