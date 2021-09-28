import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class UpdateEmailWithValidation extends Component {
  @service store;

  @tracked newEmail = '';
  @tracked showEmailForm = true;

  @action
  showVerificationCode(newEmail) {
    this.newEmail = newEmail.trim();
    this.showEmailForm = false;
  }
}
