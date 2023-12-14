import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';

export default class ModuleQrocm extends Component {
  @tracked selectedValues;

  qrocm = this.args.qrocm;

  @action
  onSelectChange(block, value) {
    this.selectedValues = {
      ...this.selectedValues,
      [block.input]: value,
    };
  }
}
