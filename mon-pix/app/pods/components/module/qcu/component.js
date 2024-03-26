import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class ModuleQcu extends Component {
  @tracked selectedAnswerId = null;
  @tracked requiredMessage = false;
  @tracked isOnRetryMode = false;

  qcu = this.args.qcu;

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

  @action
  radioClicked(proposalId) {
    this.selectedAnswerId = proposalId;
  }

  @action
  retry(button) {
    this.isOnRetryMode = true;
    this.selectedAnswerId = null;
    button.target.parentElement.reset();
  }

  @action
  async submitAnswer(event) {
    event.preventDefault();
    if (!this.selectedAnswerId) {
      this.requiredMessage = true;

      return;
    }
    this.isOnRetryMode = false;
    this.requiredMessage = false;
    const answerData = { userResponse: [this.selectedAnswerId], element: this.qcu };
    await this.args.submitAnswer(answerData);
  }
}
