import Component from '@glimmer/component';

export default class CampaignFilters extends Component {
  get isArchived() {
    return this.args.statusFilter === 'archived';
  }

  get isClearFiltersButtonDisabled() {
    return (
      !this.args.nameFilter &&
      !this.args.statusFilter &&
      (this.args.listOnlyCampaignsOfCurrentUser || !this.args.ownerNameFilter)
    );
  }
}
