import Service, { service } from '@ember/service';
import ENV from 'mon-pix/config/environment';

export default class EmailVerificationCodeService extends Service {
  @service requestManager;
  @service currentUser;

  async sendNewEmail({ password, newEmail, action }) {
    const userId = this.currentUser.user.get('id');
    return await this.requestManager.request({
      url: `${ENV.APP.API_HOST}/api/users/${userId}/email/verification-code`,
      method: 'PUT',
      body: JSON.stringify({
        data: {
          type: 'email-verification-codes',
          attributes: {
            password,
            'new-email': newEmail,
            action,
          },
        },
      }),
    });
  }

  async verifyCode({ code, action }) {
    const path = action === 'add-email' ? 'add-email-connection-method' : 'update-email';

    const userId = this.currentUser.user.get('id');
    const response = await this.requestManager.request({
      url: `${ENV.APP.API_HOST}/api/users/${userId}/${path}`,
      method: 'POST',
      body: JSON.stringify({
        data: {
          type: 'email-verification-codes',
          attributes: {
            code,
          },
        },
      }),
    });
    return response.content.data.attributes.email;
  }
}
