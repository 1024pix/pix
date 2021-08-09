import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class UpdateScoRecordController extends Controller {

  @service store;
  @service intl;
  @service router;

  @tracked errorMessage = this.model.errorMessage;
  @tracked showReturnToHomeButton = this.model.showReturnToHomeButton;
  @tracked showRenewLink = this.model.showRenewLink;

  @tracked isLoading = false;

  @action
  async updateRecord(password) {
    const updateDemand = this.store.createRecord('account-recovery-demand', {
      temporaryKey: this.model.temporaryKey,
      password,
    });
    try {
      this.isLoading = true;
      await updateDemand.update();
      this.router.transitionTo('login');
    } catch (err) {
      this._handleError(err);
    } finally {
      this.isLoading = false;
    }
  }

  _handleError(err) {
    const { status, code } = err.errors?.[0] || {};

    const internalError = {
      errorMessage: this.intl.t('api-error-messages.internal-server-error'),
      showRenewLink: false,
      showReturnToHomeButton: true,
    };

    const errorDetails = {
      ACCOUNT_WITH_EMAIL_ALREADY_EXISTS: {
        errorMessage: this.intl.t('pages.account-recovery.errors.account-exists'),
        showRenewLink: false,
        showReturnToHomeButton: true,
      },
      401: {
        errorMessage: this.intl.t('pages.account-recovery.errors.key-expired'),
        showRenewLink: true,
        showReturnToHomeButton: false,
      },
      403: {
        errorMessage: this.intl.t('pages.account-recovery.errors.key-used'),
        showRenewLink: false,
        showReturnToHomeButton: true,
      },
      404: {
        errorMessage: this.intl.t('pages.account-recovery.errors.key-invalid'),
        showRenewLink: false,
        showReturnToHomeButton: true,
      },
    };

    const { errorMessage, showRenewLink, showReturnToHomeButton } = errorDetails[status] || errorDetails[code] || internalError;
    this.errorMessage = errorMessage;
    this.showRenewLink = showRenewLink;
    this.showReturnToHomeButton = showReturnToHomeButton;
  }
}
