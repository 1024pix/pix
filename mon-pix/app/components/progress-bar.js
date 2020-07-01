import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/string';
import colorGradient from 'mon-pix/utils/color-gradient';
import progressInAssessment from 'mon-pix/utils/progress-in-assessment';

export default class ProgressBar extends Component {
  @service media;

  MINIMUM_WIDTH_STEP_IN_PERCENT = 1.7;
  MINIMUM_WIDTH_STEP_IN_PIXEL = 16;

  get showProgressBar() {
    return this.args.assessment.showProgressBar && this.media.isDesktop;
  }

  get currentStepIndex() {
    return progressInAssessment.getCurrentStepIndex(this.args.assessment, this.args.answerId);
  }

  get maxStepsNumber() {
    return progressInAssessment.getMaxStepsNumber(this.args.assessment);
  }

  get currentStepNumber() {
    return progressInAssessment.getCurrentStepNumber(this.args.assessment, this.args.answerId);
  }

  get steps() {
    const steps = [];

    const gradient = colorGradient('#388AFF', '#985FFF', this.maxStepsNumber);

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
    const widthPercent = this.MINIMUM_WIDTH_STEP_IN_PERCENT + (100 - this.MINIMUM_WIDTH_STEP_IN_PERCENT) * this.currentStepIndex  / (this.maxStepsNumber - 1);

    const width = this.currentStepIndex === 0 ? `${this.MINIMUM_WIDTH_STEP_IN_PIXEL}px` : `${widthPercent}%`;

    return htmlSafe(`width: ${width};`);
  }
}
