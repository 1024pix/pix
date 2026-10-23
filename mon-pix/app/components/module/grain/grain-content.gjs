import { action } from '@ember/object';
import Component from '@glimmer/component';
import { eq } from 'ember-truth-helpers';
import Element from 'mon-pix/components/module/component/element';
import Stepper from 'mon-pix/components/module/component/stepper';
import ModuleGrain from 'mon-pix/components/module/grain/grain';

export default class ModuleGrainContent extends Component {
  get displayableComponents() {
    return ModuleGrain.getSupportedComponents(this.args.grain);
  }

  get stepperDirection() {
    if (['challenge', 'activity', 'discovery'].includes(this.args.grain.type)) {
      return ModuleGrain.STEPPER_DIRECTION.HORIZONTAL;
    }
    return ModuleGrain.STEPPER_DIRECTION.VERTICAL;
  }

  @action
  preventStepperInitialScrollAndFocus(index) {
    return index !== 0;
  }

  <template>
    <div class="grain-card__content">
      {{#each this.displayableComponents as |component index|}}
        {{#if (eq component.type "element")}}
          <div class="grain-card-content__element">
            <Element
              @element={{component.element}}
              @passageId={{@passage.id}}
              @onImageAlternativeTextOpen={{@onImageAlternativeTextOpen}}
              @onVideoTranscriptionOpen={{@onVideoTranscriptionOpen}}
              @onElementAnswer={{@onElementAnswer}}
              @onElementRetry={{@onElementRetry}}
              @getLastCorrectionForElement={{@getLastCorrectionForElement}}
              @onFileDownload={{@onFileDownload}}
              @onExpandToggle={{@onExpandToggle}}
              @updateSkipButton={{@updateSkipButton}}
            />
          </div>
        {{else if (eq component.type "stepper")}}
          <div class="grain-card-content__stepper">
            <Stepper
              @steps={{component.steps}}
              @onElementAnswer={{@onElementAnswer}}
              @onElementRetry={{@onElementRetry}}
              @passage={{@passage}}
              @getLastCorrectionForElement={{@getLastCorrectionForElement}}
              @stepperIsFinished={{@stepperIsFinished}}
              @onStepperNextStep={{@onStepperNextStep}}
              @onImageAlternativeTextOpen={{@onImageAlternativeTextOpen}}
              @onVideoTranscriptionOpen={{@onVideoTranscriptionOpen}}
              @onFileDownload={{@onFileDownload}}
              @onExpandToggle={{@onExpandToggle}}
              @preventInitialFocusAndScroll={{this.preventStepperInitialScrollAndFocus index}}
              @direction={{this.stepperDirection}}
              @updateSkipButton={{@updateSkipButton}}
              @instruction={{component.instruction}}
            />
          </div>
        {{/if}}
      {{/each}}
    </div>
  </template>
}
