import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import isEmailValid from '../utils/email-validator';

export default class UserAccountPanel extends Component {

  @tracked isEmailEditionMode = false;
  @tracked newEmail = '';

  get displayUsername() {
    return !!this.args.user.username;
  }

  @action
  enableEmailEditionMode() {
    this.isEmailEditionMode = true;
  }

  @action
  disableEmailEditionMode() {
    this.isEmailEditionMode = false;
  }

  @action
  saveNewEmail() {
    if (isEmailValid(this.newEmail)) {
      this.args.user.email = this.newEmail;
      this.args.user.save({ adapterOptions: { updateEmail: true } });
      this.isEmailEditionMode = false;
    }
  }
}
