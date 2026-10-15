import Service, { service } from '@ember/service';
import ENV from 'mon-pix/config/environment';

export default class UpdatePasswordService extends Service {
  @service requestManager;
  @service currentUser;

  async updatePassword({ currentPassword, newPassword }) {
    const userId = this.currentUser.user.get('id');
    return await this.requestManager.request({
      url: `${ENV.APP.API_HOST}/api/users/${userId}/update-password`,
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
