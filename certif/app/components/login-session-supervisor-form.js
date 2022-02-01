import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import get from 'lodash/get';

export default class LoginSessionSupervisorForm extends Component {
  @tracked sessionId;
  @tracked supervisorPassword;
  @tracked errorMessage = null;

  @action
  async superviseSession(event) {
    event.preventDefault();

    if (!this.sessionId || !this.supervisorPassword) {
      this._displayError('Les champs "Numéro de la session" et "Mot de passe de session" sont obligatoires.');
      return;
    }

    try {
      await this.args.onFormSubmit({
        sessionId: this.sessionId,
        supervisorPassword: this.supervisorPassword,
      });
    } catch (error) {
      const errorMessage = get(error, 'errors[0].detail');
      this._displayError(errorMessage);
    }
  }

  _displayError(message) {
    this.errorMessage = message;
  }
}
