import { service } from '@ember/service';
import Component from '@glimmer/component';

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
      La page de blocage
    {{/if}}
  </template>
}
