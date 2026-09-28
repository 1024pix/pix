import { PixProgressBar, PixStepper } from '@1024pix/nebulix-ember';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import t from 'ember-intl/helpers/t';
import progressInAssessment from 'mon-pix/utils/progress-in-assessment';

export default class InfoBar extends Component {
  @service media;
  @service locale;

  get isCertification() {
    return this.args.assessment.isCertification;
  }

  get certificationNumber() {
    return new Intl.NumberFormat(this.locale.currentLocale).format(this.args.certificationNumber);
  }

  get showChallengeStepper() {
    return !this.isCertification && this.args.assessment.showChallengeStepper;
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
    {{#if @showGlobalProgression}}
      <PixProgressBar
        @value={{@completionRate}}
        @label={{t "components.info-bar.completion-percentage.label" completion=@completionRate}}
        @percentageValue={{t "common.display.percentage" value=@completionRate}}
        @subtitle={{t "components.info-bar.completion-percentage.caption"}}
        @themeMode="dark"
      />
    {{else if this.showChallengeStepper}}
      <PixStepper @currentStep={{this.currentStepNumber}} @steps={{this.steps}} />
    {{else if this.isCertification}}
      <dl class="info-bar">
        <div>
          <dt class="info-bar__label">{{t "components.info-bar.certification-number"}}
          </dt>
          <dd class="info-bar__value">{{this.certificationNumber}}</dd>
        </div>
        <div>
          <dt class="info-bar__label">{{t "components.info-bar.progress.label"}}</dt>
          <dd
            class="info-bar__value"
            aria-label={{t
              "components.info-bar.progress.position"
              current=this.currentStepNumber
              total=this.maxStepsNumber
            }}
          >
            {{this.currentStepNumber}}
            /
            {{this.maxStepsNumber}}
          </dd>
        </div>
      </dl>
    {{/if}}
  </template>
}
