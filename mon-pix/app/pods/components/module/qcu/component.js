import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

import ModuleElement from '../element/component';

export default class ModuleQcu extends ModuleElement {
  @tracked selectedAnswerId = null;

  @action
  radioClicked(proposalId) {
    this.selectedAnswerId = proposalId;
  }

  resetAnswers() {
    this.selectedAnswerId = null;
  }

  get canValidateElement() {
    return !!this.selectedAnswerId;
  }

  get userResponse() {
    return [this.selectedAnswerId];
  }

  get disableInput() {
    return super.disableInput ? 'true' : null;
  }
}
