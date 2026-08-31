import Route from '@ember/routing/route';
import { service } from '@ember/service';
import get from 'lodash/get';
import ENV from 'mon-pix/config/environment';

export default class ResetPasswordRoute extends Route {
  @service requestManager;
  @service errors;
  @service router;

  async model(params) {
    const passwordResetTemporaryKey = params.temporary_key;
    try {
      await this.requestManager.request({
        url: `${ENV.APP.API_HOST}/api/check-password-reset-demand`,
        method: 'POST',
        body: JSON.stringify({ 'temporary-key': passwordResetTemporaryKey }),
      });

      return { temporaryKey: passwordResetTemporaryKey };
    } catch (error) {
      const status = get(error, 'errors[0].status');
      if (status && (status === 401 || (status && 404))) {
        const error = 'pages.reset-password.error.expired-demand';
        this.errors.push(error);
        this.router.replaceWith('password-reset-demand');
      }
    }
  }
}
