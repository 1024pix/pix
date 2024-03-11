import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class UpdateEmailWithValidation extends Component {
  @service store;

  @tracked newEmail = '';
  @tracked password = '';
  @tracked showEmailForm = true;

  @action
  showVerificationCode({ newEmail, password }) {
    this.newEmail = newEmail.trim();
    this.password = password;
    this.showEmailForm = false;
  }
}
