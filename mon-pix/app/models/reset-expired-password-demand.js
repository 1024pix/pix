import { memberAction } from '@1024pix/ember-api-actions';
import Model, { attr } from '@ember-data/model';

export default class ResetExpiredPasswordDemand extends Model {
  @attr('string') passwordResetToken;
  @attr('string') newPassword;
  @attr('string') login;

  updateExpiredPassword = memberAction({
    path: 'expired-password-updates',
    type: 'post',
    before() {
      const payload = this.serialize();
      delete payload.data.attributes.login;
      return payload;
    },
    after(response) {
      return response.data.attributes.login;
    },
  });
}
