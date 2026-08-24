import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixInputPassword from '@1024pix/pix-ui/components/pix-input-password';
import PixNotificationAlert from '@1024pix/pix-ui/components/pix-notification-alert';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';

import { dayjsUtcFormat } from '../../helpers/dayjs-utc-format';

export default class LoginSessionInvigilator extends Component {
  @service intl;

  @tracked formError = null;
  @tracked sessionIdValue = null;
  @tracked invigilatorPasswordValue = null;

  @action
  setSessionIdValue(event) {
    this.sessionIdValue = event.target.value;
  }

  @action
  setInvigilatorPasswordValue(event) {
    this.invigilatorPasswordValue = event.target.value;
  }

  @action
  async handleFormSubmit(event) {
    event.preventDefault();

    if (!this.sessionIdValue || !this.invigilatorPasswordValue) {
      this.formError = this.intl.t('pages.session-supervising.login.form.errors.mandatory-fields');
      return;
    }

    try {
      await this.args.authenticateInvigilator({
        sessionId: this.sessionIdValue,
        invigilatorPassword: this.invigilatorPasswordValue,
      });
    } catch ({ errors }) {
      const error = errors[0];
      switch (error.code) {
        case 'CERTIFICATION_CENTER_IS_ARCHIVED':
          this.formError = this.intl.t('pages.session-supervising.login.form.errors.certification-center-archived');
          break;
        case 'SESSION_FINALIZED':
          this.formError = this.intl.t('pages.session-supervising.login.form.errors.session-finalized');
          break;
        case 'SESSION_NOT_JOINABLE':
          this.formError = this.intl.t('pages.session-supervising.login.form.errors.session-not-joinable', {
            date: dayjsUtcFormat([error.meta?.blockedAccessDate, 'DD/MM/YYYY'], {}),
          });
          break;
        default:
          this.formError = this.intl.t('pages.session-supervising.login.form.errors.incorrect-data');
          break;
      }
    }
  }

  <template>
    {{#if this.formError}}
      <div class='login-session-invigilator__form-error' role='alert'>
        <PixNotificationAlert @type='error' @withIcon={{true}}>
          {{this.formError}}
        </PixNotificationAlert>
      </div>
    {{/if}}
    <form
      class='login-session-invigilator__form'
      {{on 'submit' this.handleFormSubmit}}
      aria-label={{t 'pages.session-supervising.login.form.aria-label'}}
    >
      <PixInput
        @id='session-id'
        type='number'
        @requiredLabel={{t 'common.forms.required'}}
        {{on 'input' this.setSessionIdValue}}
      >
        <:label>{{t 'pages.session-supervising.login.form.session-number'}}</:label>
      </PixInput>

      <PixInputPassword
        @id='session-password'
        @requiredLabel={{t 'common.forms.required'}}
        @ariaLabel={{t 'pages.session-supervising.login.form.session-password.aria-label'}}
        @subLabel={{t 'pages.session-supervising.login.form.description'}}
        @prefix='C-'
        placeholder='XXXXXX'
        {{on 'input' this.setInvigilatorPasswordValue}}
      >
        <:label>{{t 'pages.session-supervising.login.form.session-password.label'}}</:label>
      </PixInputPassword>

      <PixButton @type='submit'>
        {{t 'pages.session-supervising.login.form.actions.invigilate'}}
      </PixButton>
    </form>
  </template>
}
