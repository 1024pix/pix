import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixSelect from '@1024pix/pix-ui/components/pix-select';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import isEmailValid from '../../utils/email-validator';

export default class AddMember extends Component {
  @service notifications;
  @service store;
  @service errorResponseHandler;

  @tracked email = '';
  @tracked role = 'SUPER_ADMIN';
  @tracked inviteErrorRaised;
  @tracked validationStatus = 'default';

  CUSTOM_ERROR_STATUS_MESSAGES = {
    STATUS_404: "Cet utilisateur n'existe pas.",
  };

  @action
  async inviteMember(event) {
    event.preventDefault();

    if (!this._isEmailValid()) {
      return;
    }

    const members = this.store.peekAll('admin-member');
    if (members.find((member) => member.email === this.email)) {
      this.errorResponseHandler.notify('Cet agent a déjà accès');
      return;
    }

    let adminMember;

    try {
      adminMember = this.store.createRecord('admin-member', { email: this.email, role: this.role });
      await adminMember.save();
      this.email = '';
      this.role = 'SUPER_ADMIN';
      this.notifications.success(
        `L'agent ${adminMember.firstName} ${adminMember.lastName} a dorénavant accès à Pix Admin`,
      );
    } catch (errorResponse) {
      this.store.deleteRecord(adminMember);
      this.errorResponseHandler.notify(errorResponse, this.CUSTOM_ERROR_STATUS_MESSAGES);
    }
  }

  @action
  emailChanged(event) {
    this.email = event?.target?.value?.trim() ?? null;
  }

  @action
  roleChanged(value) {
    this.role = value ?? null;
  }

  _isEmailValid() {
    if (!this.email) {
      this.inviteErrorRaised = 'Le champ adresse e-mail est requis.';
      this.validationStatus = 'error';
      return false;
    }

    if (!isEmailValid(this.email)) {
      this.inviteErrorRaised = "L'adresse e-mail saisie n'est pas valide.";
      this.validationStatus = 'error';
      return false;
    }

    this.inviteErrorRaised = null;
    this.validationStatus = 'success';
    return true;
  }

  <template>
    <form class="add-member-to-team-form" onsubmit={{this.inviteMember}}>
      <h2 class="pix-text--large">Donner accès à un agent Pix</h2>

      <section class="add-member-to-team-form__content">
        <section class="add-member-to-team-form__input">
          <PixInput
            @id="email"
            @requiredLabel={{t "common.forms.mandatory"}}
            @errorMessage={{this.inviteErrorRaised}}
            @validationStatus={{this.validationStatus}}
            value={{this.email}}
            {{on "change" this.emailChanged}}
          >
            <:label>Adresse e-mail professionnelle de l'agent Pix à rattacher</:label>
          </PixInput>
        </section>

        <section class="add-member-to-team-form__select {{if this.inviteErrorRaised 'error-padding'}}">
          <PixSelect @options={{@roles}} @value={{this.role}} @onChange={{this.roleChanged}} @screenReaderOnly={{true}}>
            <:label>Choisir le rôle à assigner au nouveau membre</:label>
          </PixSelect>
        </section>

        <PixButton
          @size="small"
          class={{if this.inviteErrorRaised "error-padding"}}
          type="submit"
          aria-label="Donner accès à un agent Pix"
          @triggerAction={{this.inviteMember}}
        >
          {{t "common.actions.validate"}}
        </PixButton>
      </section>
    </form>
  </template>
}
