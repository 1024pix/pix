import Controller from '@ember/controller';
import { service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import get from 'lodash/get';

import ENV from 'pix-certif/config/environment';

export default class AuthenticatedTeamInviteController extends Controller {
  @service currentUser;
  @service intl;
  @service notifications;
  @service router;
  @service store;

  @tracked isLoading = false;

  emails = null;

  @action
  async createCertificationCenterInvitation(event) {
    event.preventDefault();
    this.isLoading = true;

    const certificationCenterId = this.currentUser.currentAllowedCertificationCenterAccess.id;
    const emails = this.emails?.replace(/[\s\r\n]/g, '').split(',');

    try {
      await this.store.adapterFor('certification-center-invitation').sendInvitations({ certificationCenterId, emails });

      const message = this.intl.t('pages.team-invite.notifications.success.invitations', {
        emailsCount: emails.length,
        email: emails[0],
      });

      this.notifications.success(message);
      this.router.transitionTo('authenticated.team.list.invitations');
    } catch (responseError) {
      if (responseError.errors) {
        const errorMessage = this._handleApiError(responseError);
        this.notifications.error(errorMessage);
      } else {
        // eslint-disable-next-line no-console
        console.error(responseError);
        this.notifications.error(this.intl.t('common.form-errors.default'));
      }
    } finally {
      this.isLoading = false;
    }
  }

  @action
  updateEmail(event) {
    this.emails = event.target?.value;
  }

  @action
  cancel() {
    this.router.transitionTo('authenticated.team.list.invitations');
  }

  _handleApiError(responseError) {
    let errorMessage;

    const errors = get(responseError, 'errors');
    const error = Array.isArray(errors) && errors.length > 0 && errors[0];

    switch (error.code) {
      case 'INVALID_EMAIL_DOMAIN':
        errorMessage = this.intl.t('pages.team-invite.notifications.error.invitations.invalid-email-domain');
        break;
      case 'INVALID_EMAIL_ADDRESS_FORMAT':
        errorMessage = this.intl.t('pages.team-invite.notifications.error.invitations.invalid-email-format');
        break;
      case 'SENDING_EMAIL_FAILED': {
        errorMessage = this.intl.t('pages.team-invite.notifications.error.invitations.mailer-provider-unavailable');
        break;
      }
      default:
        errorMessage = this.intl.t(this._getI18nKeyByStatus(error.status));
    }

    return errorMessage;
  }

  _getI18nKeyByStatus(status) {
    switch (status) {
      case '400':
        return ENV.APP.API_ERROR_MESSAGES.BAD_REQUEST.I18N_KEY;
      default:
        return ENV.APP.API_ERROR_MESSAGES.INTERNAL_SERVER_ERROR.I18N_KEY;
    }
  }
}
