import { service } from '@ember/service';
import { htmlSafe } from '@ember/template';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import colorGradient from 'mon-pix/utils/color-gradient';
import progressInAssessment from 'mon-pix/utils/progress-in-assessment';

export default class ProgressBar extends Component {
  <template>
    <div class="assessment-progress-bar">
      {{#if this.showChallengeStepper}}
        <div class="progress-bar-container">
          {{#if this.showQuestionCounterInsideProgressBar}}
            <div
              class="progress-bar-current-step"
              role="progressbar"
              aria-valuenow={{this.currentStepNumber}}
              aria-valuemin="1"
              aria-valuemax="5"
              aria-label="{{t 'pages.challenge.parts.progress'}}"
            >
              {{t "pages.challenge.progress-bar.label"}}
              {{this.currentStepNumber}}
              /
              {{this.maxStepsNumber}}
            </div>
          {{/if}}

          <div class="progress-bar-content">
            <div class="progress-bar-background"></div>

            <div class="progress-bar-progression" style={{this.progressionWidth}}></div>

            <div class="progress-bar-steps">
              {{#each this.steps as |step|}}
                <span class="progress-bar-step" style={{step.background}}></span>
              {{/each}}
            </div>
          </div>
        </div>
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
  @service media;

  MINIMUM_WIDTH_STEP_IN_PERCENT = 1.7;
  MINIMUM_WIDTH_STEP_IN_PIXEL = 16;

  get showChallengeStepper() {
    return this.args.assessment.showChallengeStepper && this.media.isDesktop;
  }

  get showQuestionCounterInsideProgressBar() {
    return this.showChallengeStepper && this.args.assessment.showQuestionCounter;
  }

  get showQuestionCounterOutside() {
    return !this.showChallengeStepper && this.args.assessment.showQuestionCounter;
  }

  get currentStepIndex() {
    return progressInAssessment.getCurrentStepIndex(this.args.assessment, this.args.currentChallengeNumber);
  }

  get maxStepsNumber() {
    return progressInAssessment.getMaxStepsNumber(this.args.assessment);
  }

  get currentStepNumber() {
    return progressInAssessment.getCurrentStepNumber(this.args.assessment, this.args.currentChallengeNumber);
  }

  get steps() {
    const steps = [];

    const gradient = colorGradient('#3D68FF', '#8845FF', this.maxStepsNumber);

    for (let i = 0; i < this.maxStepsNumber; i++) {
      steps.push({
        stepnum: i + 1,
        status: i <= this.currentStepIndex ? 'active' : '',
        background: htmlSafe(`background: ${gradient[i]};`),
      });
    }

    return steps;
  }

  get progressionWidth() {
    const widthPercent =
      this.MINIMUM_WIDTH_STEP_IN_PERCENT +
      ((100 - this.MINIMUM_WIDTH_STEP_IN_PERCENT) * this.currentStepIndex) / (this.maxStepsNumber - 1);

    const width = this.currentStepIndex === 0 ? `${this.MINIMUM_WIDTH_STEP_IN_PIXEL}px` : `${widthPercent}%`;

    return htmlSafe(`width: ${width};`);
  }
}
