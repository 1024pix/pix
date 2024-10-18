import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixIcon from '@1024pix/pix-ui/components/pix-icon';
import PixMessage from '@1024pix/pix-ui/components/pix-message';
import { action } from '@ember/object';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

export default class LiveAlert extends Component {
  @action
  reloadAssessment() {
    this.args.assessment.reload();
  }

  <template>
    <div class="live-alert">
      <PixMessage @type="error" @withIcon={{true}}>{{@message}}</PixMessage>

      <div class="live-alert__refresh-information">
        <p>{{t "pages.challenge.live-alerts.waiting-information"}}</p>
        <PixButton
          @variant="tertiary"
          @loadingColor="grey"
          @triggerAction={{this.reloadAssessment}}
          class="refresh-information-live-alert__button"
        >
          <PixIcon @name="refresh" @ariaHidden={{true}} class="refresh-information-live-alert__icon" />
          {{t "pages.challenge.live-alerts.refresh"}}
        </PixButton>
      </div>
    </div>
  </template>
}
