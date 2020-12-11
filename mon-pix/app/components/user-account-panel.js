import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import isEmailValid from '../utils/email-validator';

export default class UserAccountPanel extends Component {

  @tracked editionMode = false;
  @tracked newEmail;

  get displayUsername() {
    return !!this.args.user.username;
  }

  get displayModifyButton() {
    return !!this.args.user.email && !this.editionMode;
  }

  @action
  toggleEditionMode() {
    this.editionMode = !this.editionMode;
  }

  @action
  save() {
    if (isEmailValid(this.newEmail)) {
      this.args.user.email = this.newEmail;
      this.args.user.save({ adapterOptions: { updateEmail: true } });
      this.editionMode = false;
    }
  }
}
