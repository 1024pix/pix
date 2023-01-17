import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import isEmailValid from '../../utils/email-validator';

export default class AddMember extends Component {
  @service notifications;
  @service store;
  @service errorResponseHandler;

  @tracked email = '';
  @tracked role = 'SUPER_ADMIN';
  @tracked inviteErrorRaised;

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
        `L'agent ${adminMember.firstName} ${adminMember.lastName} a dorénavant accès à Pix Admin`
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
