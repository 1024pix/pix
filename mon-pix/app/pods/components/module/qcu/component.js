import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class ModuleQcu extends Component {
  @tracked selectedAnswerId = null;
  @tracked requiredMessage = false;
  @tracked isOnRetryMode = false;

  qcu = this.args.qcu;

  get feedbackType() {
    return this.args.correction?.isOk ? 'success' : 'error';
  }

  get disableInput() {
    return !this.isOnRetryMode && !!this.args.correction;
  }

  get shouldDisplayFeedback() {
    return !this.isOnRetryMode && !!this.args.correction;
  }

  get shouldDisplayRetryButton() {
    return this.shouldDisplayFeedback && this.args.correction?.isOk === false;
  }

  @action
  radioClicked(proposalId) {
    this.selectedAnswerId = proposalId;
  }

  @action
  retry() {
    this.isOnRetryMode = true;
  }

  @action
  async submitAnswer(event) {
    event.preventDefault();
    if (!this.selectedAnswerId) {
      this.requiredMessage = true;

      return;
    }
    this.requiredMessage = false;
    const answerData = { userResponse: [this.selectedAnswerId], element: this.qcu };
    await this.args.submitAnswer(answerData);
  }
}
