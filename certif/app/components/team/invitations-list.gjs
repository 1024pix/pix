import { PixIconButton, PixTable, PixTableColumn, PixTooltip } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import Component from '@glimmer/component';
import dayjs from 'dayjs';
import t from 'ember-intl/helpers/t';

export default class InvitationsList extends Component {
  formatDateTime(value) {
    if (!value) return null;
    return dayjs(value).format('DD/MM/YYYY [-] HH:mm');
  }

  <template>
    {{#if @invitations}}
      <PixTable @data={{@invitations}} @variant='certif' @caption={{t 'pages.team-invitations.table.caption'}}>
        <:columns as |invitation context|>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t 'pages.team-invitations.table.labels.email-address'}}
            </:header>
            <:cell>
              {{invitation.email}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t 'pages.team-invitations.table.labels.last-sending-date'}}
            </:header>
            <:cell>
              {{this.formatDateTime invitation.updatedAt}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              {{t 'pages.team-invitations.table.labels.actions'}}
            </:header>
            <:cell>
              <div class='invitations-list__actions'>
                <PixTooltip @isInline={{true}}>
                  <:triggerElement>
                    <PixIconButton
                      @ariaLabel={{t 'pages.team-invitations.actions.resend-invitation'}}
                      @iconName='refresh'
                      @triggerAction={{fn @onResendInvitationButtonClicked invitation}}
                      disabled={{invitation.isResendingInvitation}}
                      aria-disabled={{invitation.isResendingInvitation}}
                    />
                  </:triggerElement>
                  <:tooltip>
                    {{t 'pages.team-invitations.actions.resend-invitation'}}
                  </:tooltip>
                </PixTooltip>

                <PixTooltip @isInline={{true}}>
                  <:triggerElement>
                    <PixIconButton
                      @ariaLabel={{t 'pages.team-invitations.actions.cancel-invitation'}}
                      @iconName='delete'
                      @plainIcon={{true}}
                      @triggerAction={{fn @onCancelInvitationButtonClicked invitation}}
                    />
                  </:triggerElement>
                  <:tooltip>
                    {{t 'pages.team-invitations.actions.cancel-invitation'}}
                  </:tooltip>
                </PixTooltip>
              </div>
            </:cell>
          </PixTableColumn>
        </:columns>
      </PixTable>
    {{else}}
      <div class='table__empty content-text'>
        {{t 'common.labels.table.empty-result'}}
      </div>
    {{/if}}
  </template>
}
