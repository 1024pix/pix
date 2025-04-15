import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixIconButton from '@1024pix/pix-ui/components/pix-icon-button';
import PixTable from '@1024pix/pix-ui/components/pix-table';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import PixTag from '@1024pix/pix-ui/components/pix-tag';
import PixTooltip from '@1024pix/pix-ui/components/pix-tooltip';
import { fn } from '@ember/helper';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import { and, eq, notEq } from 'ember-truth-helpers';

export default class MembersTable extends Component {
  @service currentUser;
  @service pixToast;
  @service intl;

  get isMultipleAdminsAvailable() {
    const adminMembers = this.args.members.filter((member) => member.isAdmin);
    return adminMembers.length > 1;
  }

  get shouldDisplayManagingColumn() {
    return this.currentUser.isAdminOfCurrentCertificationCenter && this.args.members.length > 1;
  }

  get shouldDisplayRefererColumn() {
    return this.args.hasCleaHabilitation;
  }

  <template>
    <PixTable @data={{@members}} @variant='certif' @caption={{t 'pages.team.table.caption'}}>
      <:columns as |member context|>
        <PixTableColumn @context={{context}}>
          <:header>
            {{t 'common.labels.candidate.lastname'}}
          </:header>
          <:cell>
            {{member.lastName}}
          </:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}}>
          <:header>
            {{t 'common.labels.candidate.firstname'}}
          </:header>
          <:cell>
            {{member.firstName}}
          </:cell>
        </PixTableColumn>
        <PixTableColumn @context={{context}}>
          <:header>
            {{t 'common.labels.candidate.role'}}
          </:header>
          <:cell>
            {{member.roleLabel}}
          </:cell>
        </PixTableColumn>
        {{#if this.shouldDisplayRefererColumn}}
          <PixTableColumn @context={{context}}>
            <:header>
              {{t 'pages.team.referer'}}
            </:header>
            <:cell>
              {{#if member.isReferer}}
                <div class='members-list-item__container'>
                  <PixTag class='members-list-item__tag' @color='purple'>
                    {{t 'pages.team.pix-referer'}}
                  </PixTag>
                  <PixTooltip class='members-list-item__tooltip' @isWide='true' @position='left'>
                    <:triggerElement>
                      <span tabindex='0'>
                        <PixIcon
                          @name='info'
                          @plainIcon={{true}}
                          @ariaHidden={{true}}
                          class='members-list-item__tooltip-icon'
                        />
                      </span>
                    </:triggerElement>
                    <:tooltip>
                      {{t 'pages.team.pix-referer-tooltip'}}
                    </:tooltip>
                  </PixTooltip>
                </div>
              {{/if}}
            </:cell>
          </PixTableColumn>
        {{/if}}
        {{#if this.shouldDisplayManagingColumn}}
          <PixTableColumn @context={{context}}>
            <:header>
              {{t 'pages.team.table-headers.actions'}}
            </:header>
            <:cell>
              <div class='invitations-list__actions'>
                {{#if (notEq this.currentUser.certificationPointOfContact.id member.id)}}
                  <PixTooltip @isInline={{true}}>
                    <:triggerElement>
                      <PixIconButton
                        @ariaLabel={{t 'pages.team.members.actions.edit-role'}}
                        @plainIcon={{true}}
                        @iconName='edit'
                        @triggerAction={{fn @onChangeMemberRoleButtonClicked member}}
                      />
                    </:triggerElement>
                    <:tooltip>
                      {{t 'pages.team.members.actions.edit-role'}}
                    </:tooltip>
                  </PixTooltip>
                {{/if}}
                {{#if (notEq this.currentUser.certificationPointOfContact.id member.id)}}
                  <PixTooltip @isInline={{true}}>
                    <:triggerElement>
                      <PixIconButton
                        @ariaLabel={{t 'pages.team.members.actions.remove-membership'}}
                        @iconName='delete'
                        @plainIcon={{true}}
                        @triggerAction={{fn @onRemoveMemberButtonClicked member}}
                      />
                    </:triggerElement>
                    <:tooltip>
                      {{t 'pages.team.members.actions.remove-membership'}}
                    </:tooltip>
                  </PixTooltip>
                {{/if}}
                {{#if
                  (and (eq this.currentUser.certificationPointOfContact.id member.id) this.isMultipleAdminsAvailable)
                }}
                  <PixTooltip @isInline={{true}}>
                    <:triggerElement>
                      <PixIconButton
                        @ariaLabel={{t 'pages.team.members.actions.leave-certification-center'}}
                        @iconName='delete'
                        @plainIcon={{true}}
                        @triggerAction={{@onLeaveCertificationCenterButtonClicked}}
                      />
                    </:triggerElement>
                    <:tooltip>
                      {{t 'pages.team.members.actions.leave-certification-center'}}
                    </:tooltip>
                  </PixTooltip>
                {{/if}}
              </div>
            </:cell>
          </PixTableColumn>
        {{/if}}
      </:columns>
    </PixTable>
  </template>
}
