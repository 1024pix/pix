import Component from '@glimmer/component';
import { action } from '@ember/object';
export default class GroupsFilter extends Component {
  @action
  async onLoadGroups() {
    const groups = await this.args.campaign.groups;
    return groups?.map(({ name }) => ({ value: name, label: name }));
  }
}
