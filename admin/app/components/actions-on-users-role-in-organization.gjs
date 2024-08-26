import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixModal from '@1024pix/pix-ui/components/pix-modal';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { action } from '@ember/object';
import { service } from '@ember/service';
import FaIcon from '@fortawesome/ember-fontawesome/components/fa-icon';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

export default class ActionsOnUsersRoleInOrganization extends Component {
  @service notifications;
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
      this.notifications.success('Le rôle du membre a été mis à jour avec succès.');
    } catch (e) {
      this.notifications.error('Une erreur est survenue lors de la mise à jour du rôle du membre.');
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
      this.notifications.success('Le membre a été désactivé avec succès.');
    } catch (e) {
      this.notifications.error('Une erreur est survenue lors de la désactivation du membre.');
    } finally {
      this.displayConfirm = false;
    }
  }

  <template>
    <td>
      {{#if this.isEditionMode}}
        <PixSelect
          class="pix-select-in-table"
          @onChange={{this.setRoleSelection}}
          @value={{this.selectedNewRole}}
          @options={{this.organizationRoles}}
          @placeholder="- Rôle -"
          @screenReaderOnly={{true}}
        >
          <:label>Sélectionner un rôle</:label>
          <:default as |organizationRole|>{{organizationRole.label}}</:default>
        </PixSelect>
      {{else}}
        {{@organizationMembership.roleLabel}}
      {{/if}}
    </td>

    {{#if this.accessControl.hasAccessToOrganizationActionsScope}}
      <td>
        <div class="member-item-actions">
          {{#if this.isEditionMode}}
            <div class="member-item-actions__modify">
              <PixButton
                @size="small"
                @triggerAction={{this.updateRoleOfMember}}
                class="member-item-actions__button member-item-actions__button--save"
              >
                {{t "common.actions.save"}}
              </PixButton>
              <PixButton
                @size="small"
                @variant="secondary"
                @triggerAction={{this.cancelUpdateRoleOfMember}}
                aria-label={{t "common.actions.cancel"}}
                class="member-item-actions__button--icon"
              >
                <FaIcon @icon="xmark" />
              </PixButton>
            </div>
          {{else}}
            <PixButton
              @isDisabled={{@organizationMembership.isSaving}}
              @size="small"
              class="member-item-actions__button"
              aria-label="Modifier le rôle"
              @triggerAction={{this.editRoleOfMember}}
              @iconBefore="pen-to-square"
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
            @iconBefore="trash"
          >
            {{t "common.actions.deactivate"}}
          </PixButton>
        </div>

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
      </td>
    {{/if}}
  </template>
}
