import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class GroupsFilter extends Component {
  @tracked isLoading;

  constructor() {
    super(...arguments);

    this.isLoading = true;
    this.args.campaign.groups.then(() => {
      this.isLoading = false;
    });
  }

  get options() {
    return this.args.campaign.groups?.map(({ name }) => ({ value: name, label: name }));
  }
}
