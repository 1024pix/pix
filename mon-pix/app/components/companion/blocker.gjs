// import PixButtonLink from '@1024pix/pix-ui/components/pix-button-link';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

import ShieldIcon from './shield-icon';

export default class CompanionBlocker extends Component {
  @service pixCompanion;

  constructor(...args) {
    super(...args);
    this.pixCompanion.startCheckingExtensionIsEnabled();
  }

  willDestroy(...args) {
    super.willDestroy(...args);
    this.pixCompanion.stopCheckingExtensionIsEnabled();
  }

  <template>
    {{#if this.pixCompanion.isExtensionEnabled}}
      {{yield}}
    {{else}}
      <section class="companion-blocker">
        <ShieldIcon />
        <h1>
          {{t "common.companion.not-detected.title" htmlSafe=true}}
        </h1>
        <p>{{t "common.companion.not-detected.description"}}</p>
        {{!-- <PixButtonLink @href="https://pix.fr" target="_blank">{{t "common.companion.not-detected.link"}}</PixButtonLink> --}}
      </section>
    {{/if}}
  </template>
}
