import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class DivisionsFilter extends Component {
  @action
  async onLoadDivisions() {
    const divisions = await this.args.model.divisions;
    return divisions?.map(({ name }) => ({ value: name, label: name }));
  }
}
