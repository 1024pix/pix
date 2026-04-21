import Component from '@glimmer/component';

import Breadcrumb from './breadcrumb';
import UpdateStage from './update-stage';
import ViewStage from './view-stage';

const LEVEL = 'Niveau';
const THRESHOLD = 'Seuil';

export default class Stage extends Component {
  get stageTypeName() {
    return this.args.stage.isTypeLevel ? LEVEL : THRESHOLD;
  }

  <template>
    <header class="header page-header">
      <Breadcrumb @targetProfileName={{@targetProfileName}} @stageId={{@stage.id}} />
    </header>

    <main class="page-body">
      {{#if @isEditMode}}
        <UpdateStage
          @stage={{@stage}}
          @isTypeLevel={{@stage.isTypeLevel}}
          @stageTypeName={{this.stageTypeName}}
          @toggleEditMode={{@toggleEditMode}}
          @availableLevels={{@availableLevels}}
          @unavailableThresholds={{@unavailableThresholds}}
          @hasLinkedCampaign={{@hasLinkedCampaign}}
          @onUpdate={{@onUpdate}}
        />
      {{else}}
        <ViewStage
          @stage={{@stage}}
          @isTypeLevel={{@stage.isTypeLevel}}
          @stageTypeName={{this.stageTypeName}}
          @toggleEditMode={{@toggleEditMode}}
        />
      {{/if}}
    </main>
  </template>
}
