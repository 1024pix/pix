import { action } from '@ember/object';
import Component from '@glimmer/component';

export default class CampaignFilters extends Component {
  get isToggleSwitched() {
    return this.args.statusFilter !== 'archived';
  }

  get isClearFiltersButtonDisabled() {
    return (
      !this.args.nameFilter &&
      !this.args.statusFilter &&
      (this.args.listOnlyCampaignsOfCurrentUser || !this.args.ownerNameFilter)
    );
  }

  @action
  onToggle() {
    const status = this.isToggleSwitched ? 'archived' : null;
    this.args.onFilter('status', status);
  }
}
