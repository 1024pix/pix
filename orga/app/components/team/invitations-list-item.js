import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import ENV from 'pix-orga/config/environment';

export default class InvitationsListItem extends Component {
  @service store;
  @service notifications;
  @service currentUser;
  @service intl;

  @tracked isResending = false;

  @action
  async resendInvitation(organizationInvitation) {
    this.isResending = true;
    try {
      const organizationId = this.currentUser.organization.id;
      await organizationInvitation.save({
        adapterOptions: {
          resendInvitation: true,
          email: organizationInvitation.email,
          organizationId,
        },
      });

      this.notifications.sendSuccess(
        this.intl.t('pages.team-new.success.invitation', { email: organizationInvitation.email }),
      );
    } catch (e) {
      this.notifications.sendError(this.intl.t('api-error-messages.global'));
    } finally {
      setTimeout(() => {
        this.isResending = false;
      }, ENV.APP.MILLISECONDS_BEFORE_MAIL_RESEND);
    }
  }
}
