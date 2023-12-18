import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ModuleQrocm extends Component {
  @tracked selectedValues;
  @tracked requiredMessage = false;

  qrocm = this.args.qrocm;

  @action
  onAnswerChanged(block, value) {
    this.selectedValues = {
      ...this.selectedValues,
      [block.input]: value,
    };
  }

  @action
  async submitAnswer(event) {
    event.preventDefault();
    this.requiredMessage = this.qrocm.proposals.some(({ input }) => {
      return !this.selectedValues?.[input];
    });
    if (this.requiredMessage) {
      return;
    }
  }
}
