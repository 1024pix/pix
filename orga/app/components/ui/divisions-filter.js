import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class DivisionsFilter extends Component {
  @tracked isLoading;

  constructor() {
    super(...arguments);

    this.isLoading = true;
    this.args.model.divisions.then(() => {
      this.isLoading = false;
    });
  }

  get options() {
    return this.args.model.divisions?.map(({ name }) => ({ value: name, label: name }));
  }
}
