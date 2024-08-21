import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';

import UpdateStage from './update-stage';
import ViewStage from './view-stage';

const LEVEL = 'Niveau';
const THRESHOLD = 'Seuil';

export default class Stage extends Component {
  get stageTypeName() {
    return this.args.stage.isTypeLevel ? LEVEL : THRESHOLD;
  }

  <template>
    <header class="page-header">
      <div class="page-title">
        <p>
          <LinkTo @route="authenticated.target-profiles.target-profile.insights">{{@targetProfileName}}</LinkTo>
          <span class="wire">&nbsp;>&nbsp;</span>
          <h1>Palier
            {{@stage.id}}
          </h1>
        </p>
      </div>
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
