import Component from '@glimmer/component';
// import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class GroupFilter extends Component {
  @service intl;
  @service currentUser;
  @tracked isLoading = true;
  @tracked campaignGroups = [];

  constructor(...args) {
    super(...args);
    this.args.campaign.groups.then((response) => {
      this.campaignGroups = response.map(({ name }) => ({ value: name, label: name }));
      this.isLoading = false;
    });
  }
}
