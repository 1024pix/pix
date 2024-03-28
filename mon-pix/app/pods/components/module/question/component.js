import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class ModuleQuestion extends Component {
  @tracked shouldDisplayRequiredMessage = false;
  @tracked isOnRetryMode = false;

  get question() {
    return this.args.question;
  }

  get feedbackType() {
    return this.correction?.isOk ? 'success' : 'error';
  }

  get disableInput() {
    return !this.isOnRetryMode && !!this.correction;
  }

  get correction() {
    if (this.isOnRetryMode) {
      return null;
    }
    return this.args.correction;
  }

  get shouldDisplayFeedback() {
    return !this.isOnRetryMode && !!this.correction;
  }

  get shouldDisplayRetryButton() {
    return this.shouldDisplayFeedback && this.correction?.isOk === false;
  }

  get userResponse() {
    throw new Error('ModuleQuestion.userResponse not implemented');
  }

  get canValidateQuestion() {
    throw new Error('ModuleQuestion.canValidateQuestion not implemented');
  }

  resetAnswers() {
    throw new Error('ModuleQuestion.resetAnswers not implemented');
  }

  @action
  retry(button) {
    this.isOnRetryMode = true;
    this.resetAnswers();
    button.target.parentElement.reset();
  }

  @action
  async submitAnswer(event) {
    event.preventDefault();
    this.shouldDisplayRequiredMessage = !this.canValidateQuestion;
    if (this.shouldDisplayRequiredMessage === true) {
      return;
    }
    this.isOnRetryMode = false;
    const answerData = { userResponse: this.userResponse, element: this.question };
    await this.args.submitAnswer(answerData);
  }
}
