import Component from '@glimmer/component';
import { t } from 'ember-intl';
import Element from 'mon-pix/components/module/element';
import ModuleGrain from 'mon-pix/components/module/grain';

export default class ModulixStep extends Component {
  get displayableElements() {
    return this.args.step.elements.filter((element) => ModuleGrain.AVAILABLE_ELEMENT_TYPES.includes(element.type));
  }

  get hasDisplayableElements() {
    return this.displayableElements.length > 0;
  }

  <template>
    {{#if this.hasDisplayableElements}}
      <section class="stepper__step">
        <h3
          class="stepper-step__position"
          aria-label="{{t 'pages.modulix.stepper.step.position' currentStep=@currentStep totalSteps=@totalSteps}}"
        >
          <span class="stepper-step-position__content">{{@currentStep}}/{{@totalSteps}}</span>
        </h3>
        {{#each this.displayableElements as |element|}}
          <div class="grain-card-content__element">
            <Element
              @element={{element}}
              @submitAnswer={{@submitAnswer}}
              @retryElement={{@retryElement}}
              @getLastCorrectionForElement={{@getLastCorrectionForElement}}
            />
          </div>
        {{/each}}
      </section>
    {{/if}}
  </template>
}
