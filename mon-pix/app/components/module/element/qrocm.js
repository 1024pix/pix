import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import ModuleElement from 'mon-pix/components/module/element/module-element';

export default class ModuleQrocm extends ModuleElement {
  @tracked selectedValues;

  get canValidateElement() {
    return this.element.proposals
      .filter(({ type }) => ['input', 'select'].includes(type))
      .every(({ input }) => {
        return !!this.selectedValues?.[input];
      });
  }

  get userResponse() {
    return Object.entries(this.selectedValues).map(([input, answer]) => {
      return {
        input,
        answer,
      };
    });
  }

  resetAnswers() {
    this.selectedValues = undefined;
  }

  get formattedProposals() {
    return this.element.proposals.map((proposal) => {
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
    return this.element.proposals.filter(({ type }) => type !== 'text').length;
  }

  @action
  onInputChanged(block, { target }) {
    this.#updateSelectedValues(block, target.value);
  }

  @action
  onSelectChanged(block, value) {
    this.#updateSelectedValues(block, value);
  }

  #updateSelectedValues(block, value) {
    this.selectedValues = {
      ...this.selectedValues,
      [block.input]: value,
    };
  }
}
