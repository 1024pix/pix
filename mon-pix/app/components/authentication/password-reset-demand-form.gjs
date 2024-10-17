import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import PixMessage from '@1024pix/pix-ui/components/pix-message';
import { on } from '@ember/modifier';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import ENV from 'mon-pix/config/environment';

import FormTextfield from '../form-textfield';

export default class PasswordResetDemandForm extends Component {
  @tracked isLoading = false;
  @tracked errorMessage;

  email = undefined;

  @action
  async sendPasswordResetDemand(event) {
    event && event.preventDefault();
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
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
    } catch (error) {
      this.errorMessage = error.message;
    } finally {
      this.isLoading = false;
    }
  }

  <template>
    <form {{on "submit" this.sendPasswordResetDemand}} class="authentication-password-reset-demand-form">
      <div>
        {{t "components.authentication.password-reset-demand.form.rule"}}
      </div>

      {{#if this.errorMessage}}
        <PixMessage
          @type="error"
          id="authentication-password-reset-demand-form__error"
          class="authentication-password-reset-demand-form__error"
          role="alert"
        >
          {{this.errorMessage}}
        </PixMessage>
      {{/if}}
      <FormTextfield
        @label="{{t 'pages.password-reset-demand.fields.email.label'}}"
        @textfieldName="email"
        @validationStatus="default"
        @inputBindingValue={{this.email}}
        @require={{true}}
        @hideRequired={{true}}
        @placeholder="jean.dupont@example.net"
        @aria-describedby="authentication-password-reset-demand-form__error"
      />
      <PixButton @type="submit" @isLoading={{this.isLoading}} class="authentication-password-reset-demand-form__button">
        {{t "components.authentication.password-reset-demand.actions.receive-reset-link"}}
      </PixButton>
      <div class="authentication-password-reset-demand-form__help">
        {{t "components.authentication.password-reset-demand.form.no-email"}}
        <PixButtonLink
          @variant="tertiary"
          @href="{{t 'components.authentication.password-reset-demand.contact-us-link.link-url'}}"
          class="authentication-password-reset-demand-form__help-contact-us-link"
        >
          {{t "components.authentication.password-reset-demand.contact-us-link.link-text"}}
        </PixButtonLink>
      </div>
    </form>
  </template>
}
