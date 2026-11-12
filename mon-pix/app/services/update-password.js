import Service, { service } from '@ember/service';
import ENV from 'mon-pix/config/environment';

export default class UpdatePasswordService extends Service {
  @service requestManager;

  async updatePassword({ currentPassword, newPassword }) {
    return await this.requestManager.request({
      url: `${ENV.APP.API_HOST}/api/users/me/password`,
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'password-updates',
          attributes: {
            'current-password': currentPassword,
            'new-password': newPassword,
          },
        },
      }),
    });
  }
}
