import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import get from 'lodash/get';

import LoginSessionSupervisorFooter from './footer';
import LoginSessionSupervisorForm from './form';
import LoginSessionSupervisorHeader from './header';

export default class LoginSessionSupervisor extends Component {
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
      await this.args.authenticateSupervisor({
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

  <template>
    <div id='login-session-supervisor-page'>
      <main>
        <section>
          <LoginSessionSupervisorHeader @errorMessage={{this.errorMessage}} />

          <LoginSessionSupervisorForm
            @superviseSession={{this.superviseSession}}
            @setSessionId={{this.setSessionId}}
            @setSupervisorPassword={{this.setSupervisorPassword}}
          />

          <p class='description'>
            {{t 'pages.session-supervising.login.form.description'}}
          </p>
        </section>

        <LoginSessionSupervisorFooter @currentUserEmail={{@currentUserEmail}} />
      </main>
    </div>
  </template>
}
