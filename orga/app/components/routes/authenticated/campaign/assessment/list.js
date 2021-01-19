import Component from '@glimmer/component';
import { action } from '@ember/object';
import { inject as service } from '@ember/service';

export default class List extends Component {
  @service currentUser;

  get displayFilters() {
    return this.displayBadgesFilter || this.displayDivisionFilter;
  }

  get displayBadgesFilter() {
    const { badges } = this.args.campaign;
    return Boolean(badges) && badges.length > 0;
  }

  get badgeOptions() {
    return this.args.campaign.badges.map(({ id, title }) => ({ value: id, label: title }));
  }

  @action
  onSelectBadge(badges) {
    this.args.triggerFiltering({ badges });
  }

  get displayDivisionFilter() {
    return this.currentUser.isSCOManagingStudents;
  }

  get divisionOptions() {
    return this.args.campaign.divisions.map(({ name }) => ({ value: name, label: name }));
  }

  @action
  onSelectDivision(divisions) {
    this.args.triggerFiltering({ divisions });
  }
}
