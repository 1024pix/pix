import { memberAction } from '@1024pix/ember-api-actions';
import Model, { attr } from '@warp-drive/legacy/model';

export default class EmailVerificationCode extends Model {
  @attr('string') newEmail;
  @attr('string') password;
  @attr('string') code;
  @attr('string') action;

  sendNewEmail = memberAction({
    path: 'email/verification-code',
    type: 'PUT',
    before() {
      const payload = this.serialize();
      delete payload.data.attributes.code;
      return payload;
    },
  });

  verifyCode() {
    if (this.action === 'add-email') {
      return this._verifyCodeToAddEmail();
    }
    return this._verifyCodeToUpdateEmail();
  }

  _verifyCodeToUpdateEmail = memberAction({
    path: 'update-email',
    type: 'POST',
    before() {
      const payload = this.serialize();
      delete payload.data.attributes['new-email'];
      delete payload.data.attributes.password;
      delete payload.data.attributes.action;
      return payload;
    },
    after(response) {
      return response?.data?.attributes?.email;
    },
  });

  _verifyCodeToAddEmail = memberAction({
    path: 'add-email-connection-method',
    type: 'POST',
    before() {
      const payload = this.serialize();
      delete payload.data.attributes['new-email'];
      delete payload.data.attributes.password;
      delete payload.data.attributes.action;
      return payload;
    },
    after(response) {
      return response?.data?.attributes?.email;
    },
  });
}
