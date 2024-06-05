import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import Step from 'mon-pix/components/module/step';
import { inc } from 'mon-pix/helpers/inc';

export default class ModulixStepper extends Component {
  @tracked
  stepsToDisplay = [this.args.steps[0]];

  <template>
    {{#each this.stepsToDisplay as |step index|}}
      <Step @step={{step}} @currentStep={{inc index}} @totalSteps={{@steps.length}} />
    {{/each}}
  </template>
}
