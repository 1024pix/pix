import PixButton from '@1024pix/pix-ui/components/pix-button';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { t } from 'ember-intl';
import Step from 'mon-pix/components/module/step';
import { inc } from 'mon-pix/helpers/inc';

export default class ModulixStepper extends Component {
  @tracked
  stepsToDisplay = [this.args.steps[0]];

  <template>
    {{#each this.stepsToDisplay as |step index|}}
      <Step @step={{step}} @currentStep={{inc index}} @totalSteps={{@steps.length}} />
    {{/each}}
    <PixButton @size="large" @variant="primary" @iconAfter="arrow-down" @triggerAction={{null}}>{{t
        "pages.modulix.buttons.stepper.next"
      }}
    </PixButton>
  </template>
}
