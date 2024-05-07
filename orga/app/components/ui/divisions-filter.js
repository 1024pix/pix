import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class DivisionsFilter extends Component {
  @tracked isLoading;
  @tracked divisions;

  constructor() {
    super(...arguments);

    this.isLoading = true;
    this.args.model.divisions.then((divisions) => {
      this.divisions = divisions;
      this.isLoading = false;
    });
  }

  get options() {
    return this.divisions?.map(({ name }) => ({ value: name, label: name }));
  }
}
