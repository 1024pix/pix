import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

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
    if (this.selectedAnswerIds.has(proposalId)) {
      this.selectedAnswerIds.delete(proposalId);
    } else {
      this.selectedAnswerIds.add(proposalId);
    }
  }

  @action
  async submitAnswer(event) {
    event.preventDefault();
    if (this.selectedAnswerIds.size < 2) {
      this.requiredMessage = true;

      return;
    }
    this.requiredMessage = false;
    const answerData = { userResponse: [...this.selectedAnswerIds], element: this.qcm };
    await this.args.submitAnswer(answerData);
  }
}
