import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class ModuleElement extends Component {
  @tracked shouldDisplayRequiredMessage = false;
  @tracked isOnRetryMode = false;

  get element() {
    return this.args.element;
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
    throw new Error('ModuleElement.userResponse not implemented');
  }

  get canValidateElement() {
    throw new Error('ModuleElement.canValidateElement not implemented');
  }

  resetAnswers() {
    throw new Error('ModuleElement.resetAnswers not implemented');
  }

  @action
  retry(button) {
    this.isOnRetryMode = true;

    this.resetAnswers();
    const form = button.target.parentElement;
    form.reset();

    this.args.retryElement({ element: this.element });
  }

  @action
  async submitAnswer(event) {
    event.preventDefault();
    this.shouldDisplayRequiredMessage = !this.canValidateElement;
    if (this.shouldDisplayRequiredMessage === true) {
      return;
    }
    this.isOnRetryMode = false;
    const answerData = { userResponse: this.userResponse, element: this.element };
    await this.args.submitAnswer(answerData);
  }
}
