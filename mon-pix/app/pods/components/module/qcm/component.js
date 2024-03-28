import { action } from '@ember/object';

import ModuleQuestion from '../question/component';

export default class ModuleQcm extends ModuleQuestion {
  selectedAnswerIds = new Set();

  get canValidateQuestion() {
    return this.selectedAnswerIds.size >= 2;
  }

  get userResponse() {
    return [...this.selectedAnswerIds];
  }

  resetAnswers() {
    this.selectedAnswerIds = new Set();
  }

  @action
  checkboxSelected(proposalId) {
    if (this.selectedAnswerIds.has(proposalId)) {
      this.selectedAnswerIds.delete(proposalId);
    } else {
      this.selectedAnswerIds.add(proposalId);
    }
  }
}
