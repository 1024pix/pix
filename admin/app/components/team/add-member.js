import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import isEmailValid from '../../utils/email-validator';

export default class AddMember extends Component {
  @service notifications;
  @service store;

  @tracked email = '';
  @tracked role = 'SUPER_ADMIN';
  @tracked inviteErrorRaised;

  @action
  async inviteMember(event) {
    event.preventDefault();

    if (!this._isEmailValid()) {
      return;
    }

    const members = this.store.peekAll('admin-member');
    if (members.find((member) => member.email === this.email)) {
      return this.notifications.error('Cet agent a déjà accès');
    }

    let adminMember;

    try {
      adminMember = this.store.createRecord('admin-member', { email: this.email, role: this.role });
      await adminMember.save();
      this.email = '';
      this.role = 'SUPER_ADMIN';
      this.notifications.success("L'agent a dorénavant accès");
    } catch (error) {
      this.store.deleteRecord(adminMember);
      let errorMessage = "Une erreur s'est produite, veuillez réessayer.";

      if (error?.errors?.length) {
        const { code, detail } = error.errors[0];

        if (code === 'USER_ACCOUNT_NOT_FOUND') {
          errorMessage = "Cet utilisateur n'existe pas";
        } else {
          errorMessage = detail;
        }
      }

      this.notifications.error(errorMessage);
    }
  }

  @action
  emailChanged(event) {
    this.email = event?.target?.value?.trim() ?? null;
  }

  @action
  roleChanged(event) {
    this.role = event?.target?.value ?? null;
  }

  _isEmailValid() {
    if (!this.email) {
      this.inviteErrorRaised = 'Le champ adresse e-mail est requis.';
      return false;
    }

    if (!isEmailValid(this.email)) {
      this.inviteErrorRaised = "L'adresse e-mail saisie n'est pas valide.";
      return false;
    }

    this.inviteErrorRaised = null;
    return true;
  }
}
