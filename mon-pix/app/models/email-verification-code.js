import Model, { attr } from '@ember-data/model';
import { memberAction } from 'ember-api-actions';

export default class EmailVerificationCode extends Model {
  @attr('string') newEmail;
  @attr('string') password;

  sendNewEmail = memberAction({
    path: 'email/verification-code',
    type: 'PUT',
    urlType: 'email-verification-code',
    before() {
      return this.serialize();
    },
  });
}
