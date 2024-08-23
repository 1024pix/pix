import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class OrganizationInvitationsAction extends Component {
  @service intl;
  @tracked organizationInvitationLang = this.languagesOptions[0].value;
  @tracked organizationInvitationRole = this.rolesOptions[0].value;

  get languagesOptions() {
    return [
      {
        label: 'Français',
        value: 'fr-fr',
      },
      {
        label: 'Francophone',
        value: 'fr',
      },
      {
        label: 'Anglais',
        value: 'en',
      },
    ];
  }

  get rolesOptions() {
    return [
      {
        label: this.intl.t('common.roles.auto'),
        value: 'NULL',
      },
      {
        label: 'Rôle Membre',
        value: 'MEMBER',
      },
      {
        label: 'Rôle Administrateur',
        value: 'ADMIN',
      },
    ];
  }

  get organizationInvitationRoleValue() {
    return this.organizationInvitationRole === 'NULL' ? null : this.organizationInvitationRole;
  }

  @action
  changeOrganizationInvitationRole(value) {
    this.organizationInvitationRole = value;
  }

  @action
  changeOrganizationInvitationLang(value) {
    this.organizationInvitationLang = value;
  }

  <template>
    <section class="page-section organization-invitations">
      <div class="organization__forms-section">
        <form>
          <h2>Inviter un membre</h2>
          <div class="organization__sub-form">
            <PixInput
              @id="userEmailToInvite"
              value={{@userEmailToInvite}}
              {{on "change" @onChangeUserEmailToInvite}}
              class="organization-invitations__input
                {{if @userEmailToInviteError 'organization-sub-form__input__error'}}"
            >
              <:label>Adresse e-mail du membre à inviter</:label>
            </PixInput>

            <PixSelect
              @options={{this.languagesOptions}}
              @value={{this.organizationInvitationLang}}
              @onChange={{this.changeOrganizationInvitationLang}}
              @placeholder="Langue"
              class="organization-invitations__select"
            >
              <:label>Choisir la langue de l’email d’invitation</:label>
            </PixSelect>

            <PixSelect
              @options={{this.rolesOptions}}
              @value={{this.organizationInvitationRole}}
              @onChange={{this.changeOrganizationInvitationRole}}
              @placeholder="Rôle"
              class="organization-invitations__select"
            >
              <:label>Choisir le rôle du membre</:label>
            </PixSelect>

            <PixButton
              @size="small"
              @triggerAction={{fn
                @createOrganizationInvitation
                this.organizationInvitationLang
                this.organizationInvitationRoleValue
              }}
              aria-label="Inviter un membre"
              class="organization-invitations__button"
              name="Inviter"
            >
              Inviter
            </PixButton>
          </div>
          {{#if @userEmailToInviteError}}
            <div class="organization-sub-form__error-message">{{@userEmailToInviteError}}</div>
          {{/if}}
        </form>
      </div>
    </section>
  </template>
}
