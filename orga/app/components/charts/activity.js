import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import sumBy from 'lodash/sumBy';

export default class Activity extends Component {
  @service store;

  @tracked participantCountByStatus = [];
  @tracked total = 0;
  @tracked shared = 0;
  @tracked participantsByStatusLoading = true;

  constructor(...args) {
    super(...args);
    const { campaignId } = this.args;

    const adapter = this.store.adapterFor('campaign-stats');

    adapter.getParticipationsByStatus(campaignId).then((response) => {
      const data = response.data.attributes;
      this.shared = data.shared;
      this.participantCountByStatus = Object.entries(data);
      this.total = sumBy(this.participantCountByStatus, ([_, count]) => count);
      this.participantsByStatusLoading = false;
    });
  }
}
