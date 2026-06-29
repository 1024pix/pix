import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import FrameworkHistory from './framework-history';
import History from './target-profile/history';

export default class CertificationFramework extends Component {
  @tracked targetProfilesHistory;
  @tracked frameworkHistory;

  constructor() {
    super(...arguments);

    this.#onMount();
  }

  async #onMount() {
    const certificationFramework = this.args.certificationFramework;

    if (certificationFramework && this.args.hasTargetProfilesHistory) {
      await certificationFramework.reload();
      this.targetProfilesHistory = certificationFramework.targetProfilesHistory;
    }
  }

  <template>
    <FrameworkHistory @frameworkKey={{@frameworkKey}} @frameworkHistory={{@frameworkHistory}} />

    {{#if this.targetProfilesHistory}}
      <History @targetProfilesHistory={{this.targetProfilesHistory}} />
    {{/if}}
  </template>
}
