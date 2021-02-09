import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';
import get from 'lodash/get';

export default class ResetPasswordRoute extends Route {
  @service errors;
  @service intl;

  async model(params) {
    const passwordResetTemporaryKey = params.temporary_key;
    try {
      const user = await this.store.queryRecord('user', { passwordResetTemporaryKey });
      return { user, temporaryKey: passwordResetTemporaryKey };
    } catch (error) {
      const status = get(error, 'errors[0].status');
      if (status && (status === 401 || status && 404)) {
        this.errors.push(this.intl.t('pages.reset-password.error'));
        this.replaceWith('password-reset-demand');
      }
    }
  }
}
