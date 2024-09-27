import { service } from '@ember/service';
import Component from '@glimmer/component';
import { t } from 'ember-intl';

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
        <h1>
          {{t "common.companion.not-detected.title" htmlSafe=true}}
        </h1>
        <p>{{t "common.companion.not-detected.description"}}</p>
      </section>
    {{/if}}
  </template>
}
