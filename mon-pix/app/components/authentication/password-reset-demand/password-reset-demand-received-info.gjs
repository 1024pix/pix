import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { hash } from '@ember/helper';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class PasswordResetDemandReceivedInfo extends Component {
  @service intl;

  get locale() {
    return this.intl.primaryLocale;
  }
  <template>
    <div class="authentication-password-reset-demand-received-info">
      <img src="/images/mail.svg" alt="" />
      <h2 class="authentication-password-reset-demand-received-info__heading">
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
          @query={{hash lang=this.locale}}
          @route="password-reset-demand"
          @variant="tertiary"
        >
          {{t "components.authentication.password-reset-demand-received-info.try-again"}}
        </PixButtonLink>
      </p>
    </div>
  </template>
}
