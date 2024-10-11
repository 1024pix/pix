import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixInput from '@1024pix/pix-ui/components/pix-input';
import PixMessage from '@1024pix/pix-ui/components/pix-message';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import ENV from 'mon-pix/config/environment';

export default class PasswordResetDemandForm extends Component {
  @service intl;

  @tracked isLoading = false;
  @tracked errorMessage;

  email = undefined;

  @action
  updateEmail(event) {
    this.email = event.target.value;
  }

  @action
  async sendPasswordResetDemand(event) {
    event && event.preventDefault();
    this.errorMessage = null;
    this.isLoading = true;

    const email = this.email.trim();
    if (!email) {
      return;
    }

    try {
      const response = await window.fetch(`${ENV.APP.API_HOST}/api/password-reset-demands`, {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      if (response.status == 404) {
        this.errorMessage = this.intl.t('pages.password-reset-demand.error.message');
      } else if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
    } catch (error) {
      this.errorMessage = this.intl.t('common.api-error-messages.internal-server-error');
    } finally {
      this.isLoading = false;
    }
  }

  <template>
    <form {{on "submit" this.sendPasswordResetDemand}} class="authentication-password-reset-demand-form">
      <p>
        {{t "components.authentication.password-reset-demand.form.rule"}}
      </p>

      {{#if this.errorMessage}}
        <PixMessage
          @type="error"
          @withIcon="{{true}}"
          class="authentication-password-reset-demand-form__error"
          role="alert"
        >
          {{this.errorMessage}}
        </PixMessage>
      {{/if}}
      <div class="authentication-password-reset-demand-form__input-block">
        <PixInput
          @value={{this.email}}
          type="email"
          {{on "change" this.updateEmail}}
          placeholder="jean.dupont@example.net"
          required={{true}}
        >
          <:label>{{t "pages.password-reset-demand.fields.email.label"}}</:label>
        </PixInput>
      </div>
      <div>
        <PixButton
          @type="submit"
          @isLoading={{this.isLoading}}
          class="authentication-password-reset-demand-form__button"
        >
          {{t "components.authentication.password-reset-demand.actions.receive-reset-button"}}
        </PixButton>
      </div>
      <p class="authentication-password-reset-demand-form__help">
        {{t "components.authentication.password-reset-demand.form.no-email"}}
        <PixButtonLink
          @variant="tertiary"
          @href="{{t 'components.authentication.password-reset-demand.contact-us-link.link-url'}}"
          target="_blank"
          class="authentication-password-reset-demand-form__help-contact-us-link"
        >
          {{t "components.authentication.password-reset-demand.contact-us-link.link-text"}}
        </PixButtonLink>
      </p>
    </form>
  </template>
}
