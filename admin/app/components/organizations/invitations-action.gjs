import { PixButton, PixInput, PixSelect } from '@1024pix/nebulix-ember';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class OrganizationInvitationsAction extends Component {
  @service intl;
  @tracked organizationInvitationLocale = this.localeOptions[0].value;
  @tracked organizationInvitationRole = this.rolesOptions[0].value;

  get localeOptions() {
    return [
      {
        label: 'Français (France)',
        value: 'fr-FR',
      },
      {
        label: 'Français (Belgique)',
        value: 'fr-BE',
      },
      {
        label: 'Français (International)',
        value: 'fr',
      },
      {
        label: 'English (International)',
        value: 'en',
      },
      {
        label: 'Nederlands (Belgïe)',
        value: 'nl-BE',
      },
      {
        label: 'Nederlands (International)',
        value: 'nl',
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
  changeInvitationLocale(value) {
    this.organizationInvitationLocale = value;
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
              @options={{this.localeOptions}}
              @value={{this.organizationInvitationLocale}}
              @onChange={{this.changeInvitationLocale}}
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
                this.organizationInvitationLocale
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
