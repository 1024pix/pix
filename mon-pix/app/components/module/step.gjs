import Component from '@glimmer/component';
import { t } from 'ember-intl';
import Element from 'mon-pix/components/module/element';

export default class ModulixStep extends Component {
  get elements() {
    return this.args.step.elements;
  }

  <template>
    <section>
      <h3
        aria-label="{{t 'pages.modulix.stepper.step.position' currentStep=@currentStep totalSteps=@totalSteps}}"
      >{{@currentStep}}/{{@totalSteps}}</h3>
      {{#each this.elements as |element|}}
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
  </template>
}
