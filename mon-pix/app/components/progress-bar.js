import { computed } from '@ember/object';
import { inject as service } from '@ember/service';
import { htmlSafe } from '@ember/string';
import colorGradient from 'mon-pix/utils/color-gradient';
import ENV from 'mon-pix/config/environment';
import Component from '@ember/component';
import classic from 'ember-classic-decorator';

const { and } = computed;

const minWidthPercent = 1.7;
const minWidthPixel = 16;

@classic
export default class ProgressBar extends Component {
  @service media;

  @and('media.isDesktop', 'assessment.showProgressBar')
  showProgressBar;

  @computed('answerId', 'assessment.answers.[]', 'challengeId', 'maxStepsNumber')
  get currentStepIndex() {
    const persistedAnswersIds = this.assessment.hasMany('answers').ids().filter((id) => id != null);
    const currentAnswerId = this.answerId;

    let index = persistedAnswersIds.indexOf(currentAnswerId);

    if (index === -1) {
      index = persistedAnswersIds.length;
    }

    return index % this.maxStepsNumber;
  }

  @computed(
    'assessment.{hasCheckpoints,certificationCourse.nbChallenges,course.nbChallenges}'
  )
  get maxStepsNumber() {
    if (this.assessment.hasCheckpoints) {
      return ENV.APP.NUMBER_OF_CHALLENGES_BETWEEN_TWO_CHECKPOINTS;
    }

    if (this.assessment.isCertification) {
      return this.assessment.get('certificationCourse.nbChallenges');
    }

    return this.assessment.get('course.nbChallenges');
  }

  @computed('currentStepIndex')
  get currentStepNumber() {
    return this.currentStepIndex + 1;
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
