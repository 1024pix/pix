import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { fn } from '@ember/helper';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { formatDate, t } from 'ember-intl';
import ENV from 'pix-orga/config/environment';

export default class InvitationsListItem extends Component {
  @service store;
  @service pixToast;
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

      this.pixToast.sendSuccessNotification({
        message: this.intl.t('pages.team-new.success.invitation', { email: organizationInvitation.email }),
      });
    } catch {
      this.pixToast.sendErrorNotification({ message: this.intl.t('api-error-messages.global') });
    } finally {
      setTimeout(() => {
        this.isResending = false;
      }, ENV.APP.MILLISECONDS_BEFORE_MAIL_RESEND);
    }
  }

  <template>
    <PixTableColumn @context={{@context}}>
      <:header>
        {{t "pages.team-invitations.table.column.email-address"}}
      </:header>
      <:cell>
        {{@invitation.email}}
      </:cell>
    </PixTableColumn>

    <PixTableColumn @context={{@context}}>
      <:header>
        {{t "pages.team-invitations.table.column.pending-invitation"}}
      </:header>
      <:cell>
        {{formatDate @invitation.updatedAt format="medium"}}
      </:cell>
    </PixTableColumn>

    <PixTableColumn @context={{@context}}>
      <:header>
        {{t "common.actions.global"}}
      </:header>
      <:cell>
        <div class="organization-participant__align-element">
          <PixTooltip @isInline={{true}}>
            <:triggerElement>
              <PixIconButton
                @ariaLabel={{t "pages.team-invitations.resend-invitation"}}
                @iconName="refresh"
                @triggerAction={{fn this.resendInvitation @invitation}}
                disabled={{this.isResending}}
                aria-disabled={{this.isResending}}
              />
            </:triggerElement>
            <:tooltip>
              {{#if this.isResending}}
                {{t "pages.team-invitations.invitation-resent-succeed-message"}}
              {{else}}
                {{t "pages.team-invitations.resend-invitation"}}
              {{/if}}
            </:tooltip>
          </PixTooltip>

          <PixTooltip @isInline={{true}}>
            <:triggerElement>
              <PixIconButton
                @ariaLabel={{t "pages.team-invitations.cancel-invitation"}}
                @iconName="delete"
                @triggerAction={{fn @cancelInvitation @invitation}}
              />
            </:triggerElement>
            <:tooltip>
              {{t "pages.team-invitations.cancel-invitation"}}
            </:tooltip>
          </PixTooltip>
        </div>
      </:cell>
    </PixTableColumn>
  </template>
}
