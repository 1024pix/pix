// import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';
import ENV from 'mon-pix/config/environment';

import ShieldIcon from './shield-icon';

export default class CompanionBlocker extends Component {
  @service pixCompanion;

  constructor(...args) {
    super(...args);
    if (ENV.APP.FT_IS_PIX_COMPANION_MANDATORY) this.pixCompanion.startCheckingExtensionIsEnabled();
  }

  willDestroy(...args) {
    super.willDestroy(...args);
    if (ENV.APP.FT_IS_PIX_COMPANION_MANDATORY) this.pixCompanion.stopCheckingExtensionIsEnabled();
  }

  get isBlocked() {
    return ENV.APP.FT_IS_PIX_COMPANION_MANDATORY && !this.pixCompanion.isExtensionEnabled;
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
