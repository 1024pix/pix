import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class NewController extends Controller {

  @service intl;
  @service notifications;
  @service store;

  @tracked isLoading = false;

  ERROR_MESSAGES;

  @action
  createOrganizationInvitation(event) {
    event.preventDefault();
    this.isLoading = true;
    this.notifications.clearAll();

    return this.model.organizationInvitation
      .save({
        adapterOptions: {
          organizationId: this.model.organizationInvitation.organizationId,
        },
      })
      .then(() => {
        this.model.organization.organizationInvitations.reload();
        this.transitionToRoute('authenticated.team');
      })
      .catch((errorResponse) => {
        this._handleResponseError(errorResponse);
      })
      .finally(() => this.isLoading = false);
  }

  @action
  cancel() {
    this.transitionToRoute('authenticated.team');
  }

  _handleResponseError({ errors }) {
    let errorMessages = [];

    if (errors) {
      errorMessages = errors.map((error) => {
        switch (error.status) {
          case '400':
            return this.ERROR_MESSAGES.STATUS_400;
          case '404':
            return this.ERROR_MESSAGES.STATUS_404;
          case '412':
            return this.ERROR_MESSAGES.STATUS_412;
          case '500':
            return this.ERROR_MESSAGES.STATUS_500;
          default:
            return this.ERROR_MESSAGES.DEFAULT;
        }
      });
    } else {
      errorMessages.push(this.ERROR_MESSAGES.DEFAULT);
    }

    const uniqueErrorMessages = new Set(errorMessages);
    uniqueErrorMessages.forEach((errorMessage) => this.notifications.sendError(errorMessage));
  }

  initErrorMessages() {
    this.ERROR_MESSAGES = {
      DEFAULT: this.intl.t('pages.team-new.errors.default'),
      STATUS_400: this.intl.t('pages.team-new.errors.status.400'),
      STATUS_404: this.intl.t('pages.team-new.errors.status.404'),
      STATUS_412: this.intl.t('pages.team-new.errors.status.412'),
      STATUS_500: this.intl.t('pages.team-new.errors.status.500'),
    };
  }
}
