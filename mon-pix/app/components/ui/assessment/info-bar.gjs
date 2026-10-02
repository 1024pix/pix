import { PixProgressBar, PixStepper } from '@1024pix/nebulix-ember';
import { hash } from '@ember/helper';
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

  get displayInfoBar() {
    return this.isCertification || this.args.assessment.isDemo || this.args.assessment.isPreview;
  }

  get certificationNumber() {
    return new Intl.NumberFormat(this.locale.currentLocale).format(this.args.certificationNumber);
  }

  get showChallengeStepper() {
    return !this.displayInfoBar && this.args.assessment.showChallengeStepper;
  }

  get maxStepsNumber() {
    return progressInAssessment.getMaxStepsNumber(this.args.assessment);
  }

  get currentStepNumber() {
    return progressInAssessment.getCurrentStepNumber(this.args.assessment, this.args.currentChallengeNumber);
  }

  get steps() {
    return Array.from({ length: this.maxStepsNumber }, (_, index) => ({
      title: index + 1,
    }));
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
      <PixStepper
        @currentStep={{this.currentStepNumber}}
        @variant="primary-light"
        @hideLabel={{true}}
        @steps={{this.steps}}
        @texts={{hash
          ariaLabel=(t "components.info-bar.progress.position" current=this.currentStepNumber total=this.maxStepsNumber)
        }}
      />
    {{else if this.displayInfoBar}}
      <dl class="info-bar">
        <div>
          {{#if this.isCertification}}
            <dt class="info-bar__label">{{t "components.info-bar.certification-number"}}
            </dt>
            <dd class="info-bar__value">{{this.certificationNumber}}</dd>
          {{/if}}
        </div>

        {{#unless @isEnded}}
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
        {{/unless}}
      </dl>
    {{/if}}
  </template>
}
