import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class LoginSessionSupervisorForm extends Component {

  @tracked isErrorMessagePresent = false;
  @tracked errorMessage = null;
  sessionId = null;
  sessionSupervisorPassword = null;

  @action
  authenticate(event) {
    event.preventDefault();

    this.args.authorize(this.sessionId);

  }
}
