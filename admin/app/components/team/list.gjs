import { PixButton, PixSelect, PixTable, PixTableColumn } from '@1024pix/nebulix-ember';
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
  @service pixToast;
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
      await adminMember.save({ adapterOptions: { method: 'updateRole' } });

      this.pixToast.sendSuccessNotification({
        message: `L'agent ${adminMember.firstName} ${adminMember.lastName} a désormais le rôle ${adminMember.updatedRole}`,
      });
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
  async deactivateAdminMember() {
    try {
      await this.adminMemberToDeactivate.save({ adapterOptions: { method: 'deactivate' } });
      await this.args.refreshValues();
      this.toggleDisplayConfirm();
      this.pixToast.sendSuccessNotification({
        message: `L'agent ${this.adminMemberToDeactivate.firstName} ${this.adminMemberToDeactivate.lastName} n'a plus accès à Pix Admin.`,
      });
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
    {{#if @members}}
      <PixTable @variant="admin" @data={{@members}} @caption={{t "pages.team.table.caption"}}>
        <:columns as |member context|>
          <PixTableColumn @context={{context}}>
            <:header>
              Prénom
            </:header>
            <:cell>
              {{member.firstName}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="break-word">
            <:header>
              Nom
            </:header>
            <:cell>
              {{member.lastName}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}} class="break-word">
            <:header>
              Adresse e-mail
            </:header>
            <:cell>
              {{member.email}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              Rôle
            </:header>
            <:cell>
              {{#if member.isInEditionMode}}
                <PixSelect
                  @onChange={{fn this.setAdminRoleSelection member}}
                  @value={{or member.updatedRole member.role}}
                  @options={{@roles}}
                  @screenReaderOnly={{true}}
                  @hideDefaultOption={{true}}
                >
                  <:label>Sélectionner un rôle</:label>
                  <:default as |role|>{{role.label}}</:default>
                </PixSelect>
              {{else}}
                {{member.role}}
              {{/if}}
            </:cell>
          </PixTableColumn>
          <PixTableColumn @context={{context}}>
            <:header>
              Actions
            </:header>
            <:cell>
              <div class="admin-member-item-actions">
                {{#if member.isInEditionMode}}
                  <PixButton
                    class="admin-member-item-actions__button"
                    aria-label="Valider la modification de rôle"
                    @triggerAction={{fn this.updateMemberRole member}}
                  >
                    {{t "common.actions.validate"}}
                  </PixButton>
                {{else}}
                  <PixButton
                    class="admin-member-item-actions__button"
                    aria-label={{concat "Modifier le rôle de l'agent " member.firstName " " member.lastName}}
                    @triggerAction={{fn this.toggleEditionModeForThisMember member}}
                    @iconBefore="edit"
                  >
                    {{t "common.actions.edit"}}
                  </PixButton>
                {{/if}}
                <PixButton
                  class="admin-member-item-actions__button"
                  @variant="error"
                  aria-label={{concat "Désactiver l'agent " member.firstName " " member.lastName}}
                  @triggerAction={{fn this.displayDeactivateConfirmationPopup member}}
                  @iconBefore="delete"
                >
                  {{t "common.actions.deactivate"}}
                </PixButton>

              </div>
            </:cell>
          </PixTableColumn>
        </:columns>
      </PixTable>
    {{else}}
      <div class="table__empty">{{t "common.tables.empty-result"}}</div>
    {{/if}}

    <ConfirmPopup
      @message={{this.confirmPopUpMessage}}
      @title="Désactivation d'un agent Pix"
      @submitTitle="Confirmer"
      @confirm={{this.deactivateAdminMember}}
      @cancel={{this.toggleDisplayConfirm}}
      @show={{this.displayConfirm}}
    />
  </template>
}
