import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class CampaignDivisionsFilter extends Component {
  @service intl;
  @service currentUser;
  @service store;

  @tracked divisions = [];
  @tracked isLoading = true;

  constructor() {
    super(...arguments);

    this.args.campaign.divisions.then((divisions) => {
      this.divisions = divisions?.map((division) => ({ value: division.name, label: division.name })) ?? [];
      this.isLoading = false;
    });
  }

  get emptyMessage() {
    if (this.isLoading) {
      return this.intl.t('common.filters.loading');
    }
    return this.intl.t('pages.campaign-results.filters.type.divisions.empty');
  }

  get placeholder() {
    const { selected } = this.args;
    if (selected?.length > 0) {
      const divisions = this.divisions
        .filter(({ value }) => selected.includes(value))
        .map(({ label }) => label)
        .join(', ');
      return this.intl.t('pages.campaign-results.filters.type.divisions.selected', { divisions });
    }
    return this.intl.t('pages.campaign-results.filters.type.divisions.title');
  }
}
