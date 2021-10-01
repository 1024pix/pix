import Model, { attr } from '@ember-data/model';
import { memberAction } from 'ember-api-actions';

export default class EmailVerificationCode extends Model {
  @attr('string') newEmail;
  @attr('string') password;
  @attr('string') code;

  sendNewEmail = memberAction({
    path: 'email/verification-code',
    type: 'PUT',
    before() {
      const payload = this.serialize();
      delete payload.data.attributes.code;
      return payload;
    },
  });

  verifyCode = memberAction({
    path: 'update-email',
    type: 'POST',
    before() {
      const payload = this.serialize();
      delete payload.data.attributes['new-email'];
      delete payload.data.attributes.password;
      return payload;
    },
    after(response) {
      return response?.data?.attributes?.email;
    },
  });
}
