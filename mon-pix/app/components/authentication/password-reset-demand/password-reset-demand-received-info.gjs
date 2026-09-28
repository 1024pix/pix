import { PixButtonLink } from '@1024pix/nebulix-ember';
import { hash } from '@ember/helper';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import didInsert from 'mon-pix/modifiers/modifier-did-insert';

export default class PasswordResetDemandReceivedInfo extends Component {
  @service locale;

  @action
  setFocus(element) {
    element.focus({ focusVisible: false });
  }

  <template>
    <div class="authentication-password-reset-demand-received-info">
      <img src="/images/mail.svg" alt="" />
      <h2 class="authentication-password-reset-demand-received-info__heading" tabindex="-1" {{didInsert this.setFocus}}>
        {{t "components.authentication.password-reset-demand-received-info.heading"}}
      </h2>
      <p class="authentication-password-reset-demand-received-info__message">
        {{t "components.authentication.password-reset-demand-received-info.message"}}
      </p>
      <p class="authentication-password-reset-demand-received-info__help">
        {{t "components.authentication.password-reset-demand-received-info.no-email-received-question"}}
        <PixButtonLink
          class="authentication-password-reset-demand-form__help-contact-us-link"
          target="_blank"
          @query={{hash lang=this.locale.currentLocale}}
          @route="password-reset-demand"
          @variant="tertiary"
        >
          {{t "components.authentication.password-reset-demand-received-info.try-again"}}
        </PixButtonLink>
      </p>
    </div>
  </template>
}
