import Service, { service } from '@ember/service';
import ENV from 'mon-pix/config/environment';

export default class ResetExpiredPasswordDemandService extends Service {
  @service requestManager;

  async updateExpiredPassword({ newPassword, passwordResetToken }) {
    const response = await this.requestManager.request({
      url: `${ENV.APP.API_HOST}/api/expired-password-updates`,
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'reset-expired-password-demands',
          attributes: {
            'new-password': newPassword,
            'password-reset-token': passwordResetToken,
          },
        },
      }),
    });
    return response.content.data.attributes.login;
  }
}
