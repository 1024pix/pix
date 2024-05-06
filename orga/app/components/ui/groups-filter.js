import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';

export default class GroupsFilter extends Component {
  @tracked isLoading;
  @tracked groups;

  constructor() {
    super(...arguments);

    this.isLoading = true;
    this.args.campaign.groups.then((groups) => {
      this.groups = groups;
      this.isLoading = false;
    });
  }

  get options() {
    return this.groups?.map(({ name }) => ({ value: name, label: name }));
  }
}
