import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class LoginSessionSupervisorForm extends Component {

  @tracked isErrorMessagePresent = false;
  @tracked errorMessage = null;

  @action
  async authenticate(sessionSupervisorPassword) {

    this.isErrorMessagePresent = true;
    this.errorMessage = `${sessionSupervisorPassword} n'est pas un mot de passe de session valide`;
  }
}
