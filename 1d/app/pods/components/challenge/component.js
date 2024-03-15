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

  get disableCheckButton() {
    return this.answerValue === null || this.answerValue === '';
  }
  @action
  setAnswerValue(value) {
    this.answerValue = value;
  }

  _createActivityAnswer(challenge) {
    return this.store.createRecord('activity-answer', { challenge });
  }

  get #assessmentId() {
    return this.args.assessment?.id;
  }

  get #isPreview() {
    return !this.#assessmentId;
  }

  @action
  async validateAnswer() {
    this.answer = this._createActivityAnswer(this.args.challenge);
    this.answer.value = this.answerValue;
    try {
      await this.answer.save({ adapterOptions: { assessmentId: this.#assessmentId, isPreview: this.#isPreview } });
      this.answerHasBeenValidated = true;
      this.scrollToTop();
    } catch (error) {
      this.answer.rollbackAttributes();
    }
  }

  scrollToTop() {
    window.scroll({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
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
    this.answer = null;

    this.router.transitionTo('assessment.resume');
  }
}
