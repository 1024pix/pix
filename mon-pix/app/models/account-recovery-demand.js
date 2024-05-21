import { memberAction } from '@1024pix/ember-api-actions';
import Model, { attr } from '@ember-data/model';

export default class AccountRecoveryDemand extends Model {
  @attr('string') ineIna;
  @attr('string') firstName;
  @attr('string') lastName;
  @attr('date-only') birthdate;
  @attr('string') email;
  @attr('string') password;
  @attr('string') temporaryKey;

  send = memberAction({
    path: 'account-recovery',
    type: 'post',
    urlType: 'send-account-recovery-demand',
    before() {
      const payload = this.serialize();
      delete payload.data.attributes.password;
      delete payload.data.attributes['temporary-key'];
      return payload;
    },
  });

  update = memberAction({
    path: 'account-recovery',
    type: 'patch',
    urlType: 'update-account',
    before() {
      const payload = this.serialize();
      payload.data.attributes = {
        password: this.password,
        'temporary-key': this.temporaryKey,
      };
      return payload;
    },
  });
}
