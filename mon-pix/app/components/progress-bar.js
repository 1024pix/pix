import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/string';
import colorGradient from 'mon-pix/utils/color-gradient';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';

const { and } = computed;

const minWidthPercent = 1.7;
const minWidthPixel = 16;

@classic
export default class ProgressBar extends Component {
  @service media;
  @service progressInAssessment;

  @and('media.isDesktop', 'assessment.showProgressBar')
  showProgressBar;

  @computed('answerId', 'assessment.answers.[]')
  get currentStepIndex() {
    return this.progressInAssessment.getCurrentStepIndex(this.assessment, this.answerId);
  }

  @computed(
    'assessment.{hasCheckpoints,certificationCourse.nbChallenges,course.nbChallenges}'
  )
  get maxStepsNumber() {
    return this.progressInAssessment.getMaxStepsNumber(this.assessment);
  }

  @computed('answerId', 'assessment.answers.[]')
  get currentStepNumber() {
    return this.progressInAssessment.getCurrentStepNumber(this.assessment, this.answerId);
  }

  @computed('currentStepIndex', 'maxStepsNumber')
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

  @computed('currentStepIndex', 'maxStepsNumber')
  get progressionWidth() {
    const widthPercent = minWidthPercent + (100 - minWidthPercent) * this.currentStepIndex  / (this.maxStepsNumber - 1);

    const width = this.currentStepIndex === 0 ? `${minWidthPixel}px` : `${widthPercent}%`;

    return htmlSafe(`width: ${width};`);
  }
}
