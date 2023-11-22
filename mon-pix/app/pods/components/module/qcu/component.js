import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ModuleQcu extends Component {
  @tracked selectedAnswerId = null;

  qcu = this.args.qcu;

  get feedbackType() {
    return this.qcu.lastCorrection?.isOk ? 'success' : 'error';
  }

  get disableInput() {
    return !!this.qcu.lastCorrection;
  }

  get shouldDisplayFeedback() {
    return !!this.qcu.lastCorrection;
  }

  @action
  radioClicked(proposalId) {
    this.selectedAnswerId = proposalId;
  }

  @action
  async submitAnswer(event) {
    event.preventDefault();
    const answerData = { userResponse: [this.selectedAnswerId], element: this.qcu };
    await this.args.submitAnswer(answerData);
  }
}
