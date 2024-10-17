// import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
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

  <template>
    {{#if this.isBlocked}}
      <section class="companion-blocker">
        <ShieldIcon />
        <h1>
          {{t "common.companion.not-detected.title" htmlSafe=true}}
        </h1>
        <p>{{t "common.companion.not-detected.description"}}</p>
        {{!-- <PixButtonLink @href="https://pix.fr" target="_blank">{{t "common.companion.not-detected.link"}}</PixButtonLink> --}}
      </section>
    {{else}}
      {{yield}}
    {{/if}}
  </template>
}
