import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';

import CompanionBlocker from '../companion/blocker';

export default class Assessments extends Component {
  @service store;

  @action
  async createLiveAlert() {
    const adapter = this.store.adapterFor('assessment');
    await adapter.createCompanionLiveAlert({ assessmentId: this.args.assessment.id });
  }

  <template>
    {{#if @assessment.isCertification}}
      <CompanionBlocker @onBlock={{this.createLiveAlert}}>
        {{yield}}
      </CompanionBlocker>
    {{else}}
      {{yield}}
    {{/if}}
  </template>
}
