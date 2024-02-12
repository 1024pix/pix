import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ModuleQcm extends Component {
  selectedAnswerIds = new Set();
  @tracked requiredMessage = false;

  qcm = this.args.qcm;

  get feedbackType() {
    return this.args.correction?.isOk ? 'success' : 'error';
  }

  get disableInput() {
    return !!this.args.correction;
  }

  get shouldDisplayFeedback() {
    return !!this.args.correction;
  }

  @action
  checkboxSelected(proposalId) {
    this.selectedAnswerId = proposalId;
  }

  @action
  async submitAnswer(event) {
    event.preventDefault();
    if (!this.selectedAnswerId) {
      this.requiredMessage = true;

      return;
    }
    this.requiredMessage = false;
    const answerData = { userResponse: [this.selectedAnswerId], element: this.qcm };
    await this.args.submitAnswer(answerData);
  }
}
