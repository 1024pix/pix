import PixProgressBar from '@1024pix/pix-ui/components/pix-progress-bar';
import PixStepper from '@1024pix/pix-ui/components/pix-stepper';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import progressInAssessment from 'mon-pix/utils/progress-in-assessment';

export default class ProgressBar extends Component {
  @service media;

  get showChallengeStepper() {
    return this.args.assessment.showChallengeStepper && this.media.isDesktop;
  }

  get showQuestionCounterOutside() {
    return !this.showChallengeStepper && this.args.assessment.showQuestionCounter;
  }
  get maxStepsNumber() {
    return progressInAssessment.getMaxStepsNumber(this.args.assessment);
  }

  get currentStepNumber() {
    return progressInAssessment.getCurrentStepNumber(this.args.assessment, this.args.currentChallengeNumber);
  }

  get steps() {
    return [
      { title: 'question 1' },
      { title: 'question 2' },
      { title: 'question 3' },
      { title: 'question 4' },
      { title: 'question 5' },
    ];
  }

  <template>
    <div>
      {{#if @showGlobalProgression}}
        <PixProgressBar
          class="checkpoint__progression-gauge"
          @value={{@completionRate}}
          @label={{t "pages.checkpoint.completion-percentage.label" completion=@completionRate}}
          @percentageValue={{t "common.display.percentage" value=@completionRate}}
          @subtitle={{t "pages.checkpoint.completion-percentage.caption"}}
          @themeMode="dark"
        />
      {{else if this.showChallengeStepper}}
        <PixStepper @currentStep={{this.currentStepNumber}} @steps={{this.steps}} />
      {{else if this.showQuestionCounterOutside}}
        <div class="assessment-progress" role="progressbar" aria-label="{{t 'pages.challenge.parts.progress'}}">
          <div class="assessment-progress__label">{{t "pages.challenge.progress-bar.label"}}</div>
          <div class="assessment-progress__value">
            {{this.currentStepNumber}}
            /
            {{this.maxStepsNumber}}
          </div>
        </div>
      {{/if}}
    </div>
  </template>
}
