import PixButton from '@1024pix/pix-ui/components/pix-button';
import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import ShieldIcon from './shield-icon';

export default class CompanionBlocker extends Component {
  @service pixCompanion;

  constructor(...args) {
    super(...args);
    if (this.args.onBlock) {
      this.pixCompanion.addEventListener('block', this.args.onBlock);
    }
    this.pixCompanion.startCheckingExtensionIsEnabled();
  }

  willDestroy(...args) {
    super.willDestroy(...args);
    this.pixCompanion.stopCheckingExtensionIsEnabled();
    if (this.args.onBlock) {
      this.pixCompanion.removeEventListener('block', this.args.onBlock);
    }
  }

  get isBlocked() {
    return !this.pixCompanion.isExtensionEnabled;
  }

  @action
  refreshPage() {
    window.location.reload(true);
  }

  <template>
    {{#if this.isBlocked}}
      <section class="companion-blocker">
        <ShieldIcon />
        <h1>
          {{t "common.companion.not-detected.title" htmlSafe=true}}
        </h1>
        <p>{{t "common.companion.not-detected.description"}}</p>

        <ul class="companion-blocker__list">
          <li>
            <PixButtonLink @href="https://cloud.pix.fr/s/KocingDC4mFJ3R6" target="_blank">{{t
                "common.companion.not-detected.link"
              }}</PixButtonLink>
          </li>
          <li>
            <PixButton
              @variant="secondary"
              @triggerAction={{this.refreshPage}}
              class="companion-blocker-list__refresh-button"
            >{{t "common.actions.refresh-page"}}</PixButton>
          </li>
        </ul>
      </section>
    {{else}}
      {{yield}}
    {{/if}}
  </template>
}
