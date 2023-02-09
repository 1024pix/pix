import Controller from '@ember/controller';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class UpdateScoRecordController extends Controller {
  @service intl;
  @service session;
  @service store;

  @tracked errorMessage = this.model.errorMessage;
  @tracked showRenewLink = this.model.showRenewLink;
  @tracked showBackToHomeButton = this.model.showBackToHomeButton;

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

      if (this.session.isAuthenticated) {
        await this.session.invalidate();
      }

      await this.session.authenticate('authenticator:oauth2', {
        login: this.model.email,
        password,
        scope: 'mon-pix',
      });
    } catch (err) {
      this._handleError(err);
    } finally {
      this.isLoading = false;
    }
  }

  _handleError(err) {
    const { status, code } = err.errors?.[0] || {};

    const internalError = {
      errorMessage: this.intl.t('common.api-error-messages.internal-server-error'),
      showRenewLink: false,
      showBackToHomeButton: true,
    };

    const errorDetails = {
      ACCOUNT_WITH_EMAIL_ALREADY_EXISTS: {
        errorMessage: this.intl.t('pages.account-recovery.errors.account-exists'),
        showRenewLink: false,
        showBackToHomeButton: true,
      },
      401: {
        errorMessage: this.intl.t('pages.account-recovery.errors.key-expired'),
        showRenewLink: true,
        showBackToHomeButton: false,
      },
      403: {
        errorMessage: this.intl.t('pages.account-recovery.errors.key-used'),
        showRenewLink: false,
        showBackToHomeButton: true,
      },
      404: {
        errorMessage: this.intl.t('pages.account-recovery.errors.key-invalid'),
        showRenewLink: false,
        showBackToHomeButton: true,
      },
    };

    const { errorMessage, showRenewLink, showBackToHomeButton } =
      errorDetails[status] || errorDetails[code] || internalError;
    this.errorMessage = errorMessage;
    this.showRenewLink = showRenewLink;
    this.showBackToHomeButton = showBackToHomeButton;
  }
}
