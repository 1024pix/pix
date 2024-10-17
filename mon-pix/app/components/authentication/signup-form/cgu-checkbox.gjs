import PixCheckbox from '@1024pix/pix-ui/components/pix-checkbox';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class CguCheckbox extends Component {
  @service url;

  get cguUrl() {
    return this.url.cguUrl;
  }

  get dataProtectionPolicyUrl() {
    return this.url.dataProtectionPolicyUrl;
  }

  get isInvalid() {
    return this.args.validationStatus === 'error';
  }

  <template>
    <div class="signup-form__cgu">
      <PixCheckbox @id={{@id}} aria-describedby="signup-cgu-description" ...attributes>
        <:label>
          {{t "common.cgu.label"}}
        </:label>
      </PixCheckbox>

      <p id="signup-cgu-description" class="signup-form__cgu-read-message">
        {{t
          "common.cgu.read-message"
          cguUrl=this.cguUrl
          dataProtectionPolicyUrl=this.dataProtectionPolicyUrl
          htmlSafe=true
        }}
      </p>

      {{#if this.isInvalid}}
        <p class="signup-form__cgu-error" aria-live="polite">
          {{@errorMessage}}
        </p>
      {{/if}}
    </div>
  </template>
}
