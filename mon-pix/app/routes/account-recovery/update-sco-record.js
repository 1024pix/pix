import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import get from 'lodash/get';

export default class UpdateScoRecordRoute extends Route {
  @service intl;
  @service store;

  async model(params) {
    const temporaryKey = params.temporary_key;
    try {
      const { email, firstName } = await this.store.queryRecord('account-recovery-demand', { temporaryKey });
      return { email, firstName, temporaryKey };
    } catch (error) {
      const status = get(error, 'errors[0].status', '');
      const code = get(error, 'errors[0].code', '');
      return this._findErrorMessage(status, code);
    }
  }

  _findErrorMessage(statusCode, code) {
    const invalidKey = {
      errorMessage: this.intl.t('pages.account-recovery.errors.key-invalid'),
      showBackToHomeButton: true,
    };

    const internalError = {
      errorMessage: this.intl.t('common.api-error-messages.internal-server-error'),
      showBackToHomeButton: true,
    };

    const httpStatusCodeMessages = {
      400: invalidKey,
      ACCOUNT_WITH_EMAIL_ALREADY_EXISTS: {
        errorMessage: this.intl.t('pages.account-recovery.errors.account-exists'),
        showBackToHomeButton: true,
      },
      401: {
        errorMessage: this.intl.t('pages.account-recovery.errors.key-expired'),
        showRenewLink: true,
      },
      403: {
        errorMessage: this.intl.t('pages.account-recovery.errors.key-used'),
        showBackToHomeButton: true,
      },
      404: invalidKey,
    };

    return httpStatusCodeMessages[code] || httpStatusCodeMessages[statusCode] || internalError;
  }
}
