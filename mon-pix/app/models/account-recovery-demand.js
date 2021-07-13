import Model, { attr } from '@ember-data/model';
import { memberAction } from 'ember-api-actions';

export default class AccountRecoveryDemand extends Model {
  @attr('string') userId;
  @attr('string') email;

  send = memberAction({
    path: 'account-recovery',
    type: 'post',
    urlType: 'send-account-recovery-demand',
    before() {
      const payload = this.serialize();
      return payload;
    },
  });
}
