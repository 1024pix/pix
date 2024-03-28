import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import ModuleQuestion from '../question/component';

export default class ModuleQcu extends ModuleQuestion {
  @tracked selectedAnswerId = null;

  @action
  radioClicked(proposalId) {
    this.selectedAnswerId = proposalId;
  }

  resetAnswers() {
    this.selectedAnswerId = null;
  }

  get canValidateQuestion() {
    return !!this.selectedAnswerId;
  }

  get userResponse() {
    return [this.selectedAnswerId];
  }
}
