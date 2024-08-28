import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { concat, fn } from '@ember/helper';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import { or } from 'ember-truth-helpers';

import ConfirmPopup from '../confirm-popup';

export default class List extends Component {
  @service store;
  @service notifications;
  @service errorResponseHandler;
  @tracked displayConfirm = false;
  @tracked editionMode = false;
  @tracked confirmPopUpMessage;

  CUSTOM_ERROR_STATUS_MESSAGES = {
    DEACTIVATE: {
      STATUS_422: 'Impossible de désactiver cet agent.',
    },
    UPDATE: {
      STATUS_422: 'Erreur lors de la mise à jour du rôle de cet agent Pix.',
    },
  };

  @action
  async toggleEditionModeForThisMember(adminMember) {
    adminMember.isInEditionMode = true;
  }

  @action
  setAdminRoleSelection(adminMember, value) {
    adminMember.updatedRole = value;
  }

  @action
  async updateMemberRole(adminMember) {
    const previousRole = adminMember.role;

    if (!adminMember.updatedRole || adminMember.updatedRole === previousRole) {
      adminMember.isInEditionMode = false;
      return;
    }

    adminMember.role = adminMember.updatedRole;
    try {
      await adminMember.save();
      this.notifications.success(
        `L'agent ${adminMember.firstName} ${adminMember.lastName} a désormais le rôle ${adminMember.updatedRole}`,
      );
    } catch (errorResponse) {
      this.errorResponseHandler.notify(errorResponse, this.CUSTOM_ERROR_STATUS_MESSAGES.UPDATE);
      adminMember.role = previousRole;
      adminMember.updatedRole = null;
    } finally {
      adminMember.isInEditionMode = false;
      adminMember.updatedRole = null;
    }
  }

  @action
  async deactivateAdminMember(adminMemberToDeactivate) {
    try {
      await this.adminMemberToDeactivate.deactivate();
      this.toggleDisplayConfirm();
      this.notifications.success(
        `L'agent ${adminMemberToDeactivate.firstName} ${adminMemberToDeactivate.lastName} n'a plus accès à Pix Admin.`,
      );
    } catch (errorResponse) {
      this.toggleDisplayConfirm();

      this.errorResponseHandler.notify(errorResponse, this.CUSTOM_ERROR_STATUS_MESSAGES.DEACTIVATE);
    }
  }

  @action
  displayDeactivateConfirmationPopup(adminMember) {
    this.adminMemberToDeactivate = adminMember;
    this.confirmPopUpMessage = `Etes-vous sûr de vouloir supprimer l'accès de ${adminMember.firstName} ${adminMember.lastName} ?`;
    this.toggleDisplayConfirm();
  }

  @action
  toggleDisplayConfirm() {
    this.displayConfirm = !this.displayConfirm;
  }

  <template>
    <div class="content-text content-text--small">
      <table aria-label="Liste des membres" class="table-admin">
        <caption class="screen-reader-only">{{t "components.team.list.table-caption"}}</caption>
        <thead>
          <tr>
            <th scope="col" id="team-member-first-name">
              {{t "components.team.list.table-headers.team-member-first-name"}}
            </th>
            <th scope="col" id="team-member-last-name">
              {{t "components.team.list.table-headers.team-member-last-name"}}
            </th>
            <th scope="col" id="team-member-email">
              {{t "components.team.list.table-headers.team-member-email"}}
            </th>
            <th scope="col" id="team-member-role">
              {{t "components.team.list.table-headers.team-member-role"}}
            </th>
            <th scope="col" id="team-member-actions">
              {{t "components.team.list.table-headers.team-member-actions"}}
            </th>
          </tr>
        </thead>
        {{#if @members}}
          <tbody>
            {{#each @members as |member|}}
              <tr aria-label={{concat member.firstName " " member.lastName}}>
                <td headers="team-member-first-name">{{member.firstName}}</td>
                <td headers="team-member-last-name">{{member.lastName}}</td>
                <td headers="team-member-email">{{member.email}}</td>
                <td headers="team-member-role">
                  {{#if member.isInEditionMode}}
                    <PixSelect
                      @onChange={{fn this.setAdminRoleSelection member}}
                      @value={{or member.updatedRole member.role}}
                      @options={{@roles}}
                      @screenReaderOnly={{true}}
                      @hideDefaultOption={{true}}
                    >
                      <:label>
                        {{t "components.team.list.labels.select-role"}}
                      </:label>
                      <:default as |role|>{{role.label}}</:default>
                    </PixSelect>
                  {{else}}
                    {{member.role}}
                  {{/if}}
                </td>
                <td headers="team-member-actions">
                  <div class="admin-member-item-actions">
                    {{#if member.isInEditionMode}}
                      <PixButton
                        class="admin-member-item-actions__button"
                        aria-label="{{t 'components.team.list.labels.confirm-role-modification'}}"
                        @triggerAction={{fn this.updateMemberRole member}}
                      >
                        {{t "common.actions.validate"}}
                      </PixButton>
                    {{else}}
                      <PixButton
                        class="admin-member-item-actions__button"
                        aria-label={{t
                          "components.team.list.labels.change-member-role"
                          firstName=member.firstName
                          lastName=member.lastName
                        }}
                        @triggerAction={{fn this.toggleEditionModeForThisMember member}}
                        @iconBefore="pen-to-square"
                      >
                        {{t "common.actions.edit"}}
                      </PixButton>
                    {{/if}}
                    <PixButton
                      class="admin-member-item-actions__button"
                      @variant="error"
                      aria-label={{t
                        "components.team.list.labels.deactivate-member"
                        firstName=member.firstName
                        lastName=member.lastName
                      }}
                      @triggerAction={{fn this.displayDeactivateConfirmationPopup member}}
                      @iconBefore="trash"
                    >
                      {{t "common.actions.deactivate"}}
                    </PixButton>
                  </div>
                </td>
              </tr>
            {{/each}}
          </tbody>
        {{/if}}
      </table>
      {{#unless @members}}
        <div class="table__empty">{{t "common.tables.no-result"}}</div>
      {{/unless}}
    </div>

    <ConfirmPopup
      @message={{this.confirmPopUpMessage}}
      @title={{t "components.team.list.labels.deactivate-confirmation"}}
      @submitTitle={{t "common.actions.confirm"}}
      @confirm={{fn this.deactivateAdminMember this.adminMemberToDeactivate}}
      @cancel={{this.toggleDisplayConfirm}}
      @show={{this.displayConfirm}}
    />
  </template>
}
