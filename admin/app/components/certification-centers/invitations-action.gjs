import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { fn } from '@ember/helper';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class CertificationCenterInvitationsAction extends Component {
  @service intl;

  @tracked invitationLanguage = this.languagesOptions[0].value;
  @tracked invitationRole = this.rolesOptions[0].value;

  languagesOptions = [
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

  rolesOptions = [
    {
      label: this.intl.t('common.roles.auto'),
      value: 'NULL',
    },
    {
      label: this.intl.t('common.roles.admin'),
      value: 'ADMIN',
    },
    {
      label: this.intl.t('common.roles.member'),
      value: 'MEMBER',
    },
  ];

  get certificationCenterRoleValue() {
    return this.invitationRole === 'NULL' ? null : this.invitationRole;
  }

  @action
  changeInvitationRole(value) {
    this.invitationRole = value;
  }

  @action
  changeInvitationLanguage(value) {
    this.invitationLanguage = value;
  }

  <template>
    <section class="page-section certification-center-invitations">
      <form>
        <h2 class="page-section__header">Inviter un membre</h2>
        <div class="certification-center-invitations-form-container">
          <PixInput
            @id="userEmailToInvite"
            value={{@userEmailToInvite}}
            {{on "change" @onChangeUserEmailToInvite}}
            class="certification-center-invitations-form-container__input
              {{if @userEmailToInviteError 'certification-center-invitations-form-container__input--error'}}"
          >
            <:label>Adresse e-mail du membre à inviter</:label>
          </PixInput>

          <PixSelect
            @options={{this.languagesOptions}}
            @value={{this.invitationLanguage}}
            @onChange={{this.changeInvitationLanguage}}
            @placeholder="Choix de la langue"
            @hideDefaultOption={{true}}
          >
            <:label>Choisir la langue de l’email d’invitation</:label>
          </PixSelect>

          <PixSelect
            @options={{this.rolesOptions}}
            @value={{this.invitationRole}}
            @onChange={{this.changeInvitationRole}}
            @placeholder="Choix du Rôle"
            @hideDefaultOption={{true}}
          >
            <:label>Choisir le rôle du membre</:label>
          </PixSelect>

          <PixButton
            @size="small"
            @triggerAction={{fn @createInvitation this.invitationLanguage this.certificationCenterRoleValue}}
            aria-label="Inviter un membre"
            class="certification-center-invitations-form-container__button"
            name="Inviter"
          >
            Inviter
          </PixButton>
        </div>
        {{#if @userEmailToInviteError}}
          <label
            for="userEmailToInvite"
            class="certification-center-invitations-form-container__error-message"
          >{{@userEmailToInviteError}}</label>
        {{/if}}
      </form>
    </section>
  </template>
}
