import { action } from '@ember/object';

import ModuleElement from '../element/component';

export default class ModuleQcm extends ModuleElement {
  selectedAnswerIds = new Set();

  get canValidateElement() {
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
