import { action } from '@ember/object';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class Challenge extends Component {
  @service store;
  @service router;
  @tracked answerHasBeenValidated = false;
  @tracked answer = null;
  @tracked answerValue = null;
  @tracked showWarningModal = false;

  @action
  setAnswerValue(value) {
    this.answerValue = value;
  }

  _createActivityAnswer(challenge) {
    return this.store.createRecord('activity-answer', { challenge });
  }

  @action
  async validateAnswer() {
    const assessmentIdForPreview = null;
    if (this.answerValue) {
      this.answer = this._createActivityAnswer(this.args.challenge);
      this.answer.value = this.answerValue;
      try {
        const assessmentId = this.args.assessment?.id || assessmentIdForPreview;
        await this.answer.save({ adapterOptions: { assessmentId } });
        this.answerHasBeenValidated = true;
      } catch (error) {
        this.answer.rollbackAttributes();
      }
    } else {
      this.showWarningModal = true;
    }
  }

  @action
  async skipChallenge() {
    this.setAnswerValue('#ABAND#');
    await this.validateAnswer();
    this.resume();
  }

  @action
  resume() {
    this.answerHasBeenValidated = false;
    this.answerValue = null;
    this.router.transitionTo('assessment.resume');
  }

  @action
  onCloseWarningModal() {
    this.showWarningModal = false;
  }
}
