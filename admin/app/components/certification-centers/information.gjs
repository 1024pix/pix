import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

import InformationEdit from './information-edit';
import InformationView from './information-view';

export default class Information extends Component {
  @tracked isEditMode = false;

  @action
  toggleEditMode() {
    this.isEditMode = !this.isEditMode;
  }

  <template>
    <section class="page-section">
      <div class="certification-center-information">
        {{#if this.isEditMode}}
          <InformationEdit
            @certificationCenter={{@certificationCenter}}
            @availableHabilitations={{@availableHabilitations}}
            @toggleEditMode={{this.toggleEditMode}}
            @onSubmit={{@updateCertificationCenter}}
          />
        {{else}}
          <InformationView
            @certificationCenter={{@certificationCenter}}
            @availableHabilitations={{@availableHabilitations}}
            @toggleEditMode={{this.toggleEditMode}}
          />
        {{/if}}
      </div>
    </section>
  </template>
}
