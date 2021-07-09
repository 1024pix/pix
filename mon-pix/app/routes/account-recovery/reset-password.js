import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import get from 'lodash/get';

export default class AccountRecoveryResetPasswordRoute extends Route {

  errors;
  @service intl;
  @service store;

  async model(params) {
    const accountRecoveryDemandTemporaryKey = params.temporary_key;
    try {
      const user = await this.store.queryRecord('user', { accountRecoveryDemandTemporaryKey });
      return { user, temporaryKey: accountRecoveryDemandTemporaryKey };
    } catch (error) {
      const status = get(error, 'errors[0].status', '');
      if (status === '401' || status === '404' || status === '409') {
        this.errors = this.intl.t('pages.account-recovery-after-leaving-sco.reset-password.invalid-demand');
        return { errors: this.errors } ;
      }
      else {
        throw error;
      }
    }
  }
}

