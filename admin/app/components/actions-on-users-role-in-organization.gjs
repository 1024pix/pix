import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import PixTableColumn from '@1024pix/pix-ui/components/pix-table-column';
import { hash } from '@ember/helper';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

export default class ActionsOnUsersRoleInOrganization extends Component {
  @service pixToast;
  @service accessControl;
  @service intl;

  @tracked isEditionMode = false;
  @tracked selectedNewRole = null;
  @tracked displayConfirm = false;

  get organizationRoles() {
    return [
      { value: 'ADMIN', label: this.intl.t('common.roles.admin') },
      { value: 'MEMBER', label: this.intl.t('common.roles.member') },
    ];
  }

  @action
  setRoleSelection(value) {
    this.selectedNewRole = value;
    this.isEditionMode = true;
  }

  @action
  async updateRoleOfMember() {
    if (!this.selectedNewRole) return;

    try {
      this.args.organizationMembership.organizationRole = this.selectedNewRole;
      await this.args.organizationMembership.save();
      this.pixToast.sendSuccessNotification({ message: 'Le rôle du membre a été mis à jour avec succès.' });
    } catch {
      this.pixToast.sendErrorNotification({
        message: 'Une erreur est survenue lors de la mise à jour du rôle du membre.',
      });
    } finally {
      this.isEditionMode = false;
    }
  }

  @action
  cancelUpdateRoleOfMember() {
    this.isEditionMode = false;
    this.selectedNewRole = null;
  }

  @action
  editRoleOfMember() {
    this.isEditionMode = true;
    this.selectedNewRole = null;
  }

  @action
  toggleDisplayConfirm() {
    this.displayConfirm = !this.displayConfirm;
  }

  @action
  async disableOrganizationMembership() {
    try {
      await this.args.organizationMembership.destroyRecord({ adapterOptions: { disable: true } });
      this.pixToast.sendSuccessNotification({ message: 'Le membre a été désactivé avec succès.' });
    } catch {
      this.pixToast.sendErrorNotification({ message: 'Une erreur est survenue lors de la désactivation du membre.' });
    } finally {
      this.displayConfirm = false;
    }
  }

  <template>
    <PixTableColumn @context={{@context}}>
      <:header>
        Rôle
      </:header>
      <:cell>
        {{#if this.isEditionMode}}
          <PixSelect
            @onChange={{this.setRoleSelection}}
            @value={{this.selectedNewRole}}
            @options={{this.organizationRoles}}
            @texts={{hash placeholder="- Rôle -"}}
            @screenReaderOnly={{true}}
          >
            <:label>Sélectionner un rôle</:label>
            <:default as |organizationRole|>{{organizationRole.label}}</:default>
          </PixSelect>
        {{else}}
          {{@organizationMembership.roleLabel}}
        {{/if}}
      </:cell>
    </PixTableColumn>

    {{#if this.accessControl.hasAccessToOrganizationActionsScope}}
      <PixTableColumn @context={{@context}}>
        <:header>
          Actions
        </:header>
        <:cell>
          <div class="member-item-actions">
            {{#if this.isEditionMode}}
              <div class="member-item-actions__modify">
                <PixButton @size="small" @triggerAction={{this.updateRoleOfMember}} class="member-item-actions__button">
                  {{t "common.actions.save"}}
                </PixButton>
                <PixButton
                  @size="small"
                  @variant="secondary"
                  @triggerAction={{this.cancelUpdateRoleOfMember}}
                  aria-label={{t "common.actions.cancel"}}
                  class="member-item-actions__button"
                >
                  <PixIcon @name="close" @ariaHidden={{true}} />
                </PixButton>
              </div>
            {{else}}
              <PixButton
                @isDisabled={{@organizationMembership.isSaving}}
                @size="small"
                class="member-item-actions__button"
                aria-label="Modifier le rôle"
                @triggerAction={{this.editRoleOfMember}}
                @iconBefore="edit"
              >
                Modifier le rôle
              </PixButton>
            {{/if}}
            <PixButton
              @size="small"
              @variant="error"
              @isDisabled={{@organizationMembership.isSaving}}
              class="member-item-actions__button"
              aria-label="Désactiver l'agent"
              @triggerAction={{this.toggleDisplayConfirm}}
              @iconBefore="delete"
            >
              {{t "common.actions.deactivate"}}
            </PixButton>
          </div>
        </:cell>
      </PixTableColumn>
    {{/if}}

    <PixModal
      @title="Désactivation d'un membre"
      @onCloseButtonClick={{this.toggleDisplayConfirm}}
      @showModal={{this.displayConfirm}}
    >
      <:content>
        <p>
          Etes-vous sûr de vouloir désactiver le membre de cette équipe ?
        </p>
      </:content>
      <:footer>
        <PixButton @variant="secondary" @triggerAction={{this.toggleDisplayConfirm}}>
          {{t "common.actions.cancel"}}
        </PixButton>
        <PixButton @triggerAction={{this.disableOrganizationMembership}}>Confirmer</PixButton>
      </:footer>
    </PixModal>
  </template>
}
