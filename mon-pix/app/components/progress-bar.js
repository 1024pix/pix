import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/string';
import colorGradient from 'mon-pix/utils/color-gradient';

export default class ProgressBar extends Component {
  @service media;
  @service progressInAssessment;

  minWidthPercent = 1.7;
  minWidthPixel = 16;

  get showProgressBar() {
    return this.args.assessment.showProgressBar && this.media.isDesktop;
  }

  get currentStepIndex() {
    return this.progressInAssessment.getCurrentStepIndex(this.args.assessment, this.args.answerId);
  }

  get maxStepsNumber() {
    return this.progressInAssessment.getMaxStepsNumber(this.args.assessment);
  }

  get currentStepNumber() {
    return this.progressInAssessment.getCurrentStepNumber(this.args.assessment, this.args.answerId);
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
    const widthPercent = this.minWidthPercent + (100 - this.minWidthPercent) * this.currentStepIndex  / (this.maxStepsNumber - 1);

    const width = this.currentStepIndex === 0 ? `${this.minWidthPixel}px` : `${widthPercent}%`;

    return htmlSafe(`width: ${width};`);
  }
}
