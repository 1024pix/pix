import { action } from '@ember/object';
import { inject as service } from '@ember/service';
import Controller from '@ember/controller';
import { tracked } from '@glimmer/tracking';

export default class NewController extends Controller {

  @service intl;
  @service notifications;
  @service store;
  @service currentUser;

  @tracked isLoading = false;

  @action
  async createOrganizationInvitation(event) {
    event.preventDefault();
    this.isLoading = true;
    this.notifications.clearAll();

    try {
      await this.model.save({
        adapterOptions: {
          organizationId: this.model.organizationId,
        },
      });
      const organization = this.currentUser.organization;
      await organization.organizationInvitations.reload();
      this.transitionToRoute('authenticated.team');
    } catch (error) {
      this._handleResponseError(error);
    }
    this.isLoading = false;
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
            return this.intl.t(ERROR_MESSAGES.STATUS_400);
          case '404':
            return this.intl.t(ERROR_MESSAGES.STATUS_404);
          case '412':
            return this.intl.t(ERROR_MESSAGES.STATUS_412);
          case '500':
            return this.intl.t(ERROR_MESSAGES.STATUS_500);
          default:
            return this.intl.t(ERROR_MESSAGES.DEFAULT);
        }
      });
    } else {
      errorMessages.push(this.intl.t(ERROR_MESSAGES.DEFAULT));
    }

    const uniqueErrorMessages = new Set(errorMessages);
    uniqueErrorMessages.forEach((errorMessage) => this.notifications.sendError(errorMessage));
  }
}

const ERROR_MESSAGES = {
  DEFAULT: 'pages.team-new.errors.default',
  STATUS_400: 'pages.team-new.errors.status.400',
  STATUS_404: 'pages.team-new.errors.status.404',
  STATUS_412: 'pages.team-new.errors.status.412',
  STATUS_500: 'pages.team-new.errors.status.500',
};
