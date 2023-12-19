import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ModuleQrocm extends Component {
  @tracked selectedValues;
  @tracked requiredMessage = false;

  qrocm = this.args.qrocm;

  @action
  onInputChanged(block, { target }) {
    this.#updateSelectedValues(block, target.value);
  }

  @action
  onSelectChanged(block, value) {
    this.#updateSelectedValues(block, value);
  }

  get disableInput() {
    return !!this.qrocm.lastCorrection;
  }

  get feedbackType() {
    return this.qrocm.lastCorrection?.isOk ? 'success' : 'error';
  }

  get shouldDisplayFeedback() {
    return !!this.qrocm.lastCorrection;
  }

  @action
  async submitAnswer(event) {
    event.preventDefault();
    this.requiredMessage = this.qrocm.proposals
      .filter(({ type }) => ['input', 'select'].includes(type))
      .some(({ input }) => {
        return !this.selectedValues?.[input];
      });
    if (this.requiredMessage) {
      return;
    }
    const answers = [];
    for (const [key, value] of Object.entries(this.selectedValues)) {
      answers.push({
        input: key,
        answer: value,
      });
    }
    const answerData = { userResponse: answers, element: this.qrocm };
    await this.args.submitAnswer(answerData);
  }

  #updateSelectedValues(block, value) {
    this.selectedValues = {
      ...this.selectedValues,
      [block.input]: value,
    };
  }
}
