import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import get from 'lodash/get';

export default class LoginSessionSupervisorForm extends Component {
  @service intl;
  @tracked errorMessage = null;
  sessionId;
  supervisorPassword;

  @action
  setSupervisorPassword(event) {
    this.supervisorPassword = event.target.value;
  }

  @action
  setSessionId(event) {
    this.sessionId = event.target.value;
  }

  @action
  async superviseSession(event) {
    event.preventDefault();

    if (!this.sessionId || !this.supervisorPassword) {
      this._displayError(this.intl.t('pages.session-supervising.login.form.errors.mandatory-fields'));
      return;
    }

    try {
      await this.args.onFormSubmit({
        sessionId: this.sessionId,
        supervisorPassword: this.supervisorPassword,
      });
    } catch (error) {
      let errorMessage = get(error, 'errors[0].detail');
      const errorCode = get(error, 'errors[0].code');
      if (errorCode === 'INCORRECT_DATA') {
        errorMessage = this.intl.t('pages.session-supervising.login.form.errors.incorrect-data');
      }

      return this._displayError(errorMessage);
    }
  }

  _displayError(message) {
    this.errorMessage = message;
  }
}
