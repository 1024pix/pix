import { service } from '@ember/service';
import Component from '@glimmer/component';

export default class SupLearnerFilters extends Component {
  @service intl;

  get certificabilityOptions() {
    return [
      {
        value: 'not-available',
        label: this.intl.t('pages.sco-organization-participants.table.column.is-certifiable.not-available'),
      },
      {
        value: 'eligible',
        label: this.intl.t('pages.sco-organization-participants.table.column.is-certifiable.eligible'),
      },
      {
        value: 'non-eligible',
        label: this.intl.t('pages.sco-organization-participants.table.column.is-certifiable.non-eligible'),
      },
    ];
  }

  get isClearFiltersButtonDisabled() {
    return (
      !this.args.searchFilter &&
      !this.args.studentNumberFilter &&
      this.args.groupsFilter.length === 0 &&
      this.args.certificabilityFilter.length === 0
    );
  }
}
