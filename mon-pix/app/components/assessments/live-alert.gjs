import { PixButton, PixIcon, PixNotificationAlert } from '@1024pix/nebulix-ember';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import Location from 'mon-pix/utils/location';

export default class LiveAlert extends Component {
  @service router;

  @action
  refreshPage() {
    Location.reload();
  }

  <template>
    <div class="live-alert">
      <PixNotificationAlert @type="error" @withIcon={{true}}>{{@message}}</PixNotificationAlert>

      <div class="live-alert__refresh-information">
        <p>{{t "pages.challenge.live-alerts.waiting-information"}}</p>
        <PixButton
          @variant="tertiary"
          @loadingColor="grey"
          @triggerAction={{this.refreshPage}}
          class="refresh-information-live-alert__button"
        >
          <PixIcon @name="refresh" @ariaHidden={{true}} class="refresh-information-live-alert__icon" />
          {{t "pages.challenge.live-alerts.refresh"}}
        </PixButton>
      </div>
    </div>
  </template>
}
