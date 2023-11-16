import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';

export default class ModuleQcu extends Component {
  @tracked selectedAnswerId = null;

  get feedbackType() {
    return this.args.correctionResponse?.isOk ? 'success' : 'error';
  }

  get disableInput() {
    return !!this.args.correctionResponse;
  }

  @action
  radioClicked(proposalId) {
    this.selectedAnswerId = proposalId;
  }

  @action
  async submitAnswer(event) {
    event.preventDefault();
    const elementId = this.args.qcu.id;
    const answerData = { elementId, userResponse: [this.selectedAnswerId] };
    await this.args.submitAnswer(answerData);
  }
}
