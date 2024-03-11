import { action } from '@ember/object';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class ModuleQrocm extends Component {
  @tracked selectedValues;
  @tracked requiredMessage = false;

  qrocm = this.args.qrocm;

  get formattedProposals() {
    return this.qrocm.proposals.map((proposal) => {
      if (proposal.type === 'select') {
        return {
          ...proposal,
          options: proposal.options.map((option) => ({ value: option.id, label: option.content })),
        };
      }
      return proposal;
    });
  }

  get nbOfProposals() {
    return this.qrocm.proposals.length;
  }

  @action
  onInputChanged(block, { target }) {
    this.#updateSelectedValues(block, target.value);
  }

  @action
  onSelectChanged(block, value) {
    this.#updateSelectedValues(block, value);
  }

  get disableInput() {
    return !!this.args.correction;
  }

  get feedbackType() {
    return this.args.correction?.isOk ? 'success' : 'error';
  }

  get shouldDisplayFeedback() {
    return !!this.args.correction;
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
    const answers = Object.entries(this.selectedValues).map(([input, answer]) => {
      return {
        input,
        answer,
      };
    });
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
