import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';

export default class EmailVerificationCode extends Component {

  @service intl;

  @action
  submitInputCode() {
    // todo
  }
}
