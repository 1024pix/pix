import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class ParticipantsByStatus extends Component {
  @service store;
  @service intl;

  @tracked data = {};

  constructor(...args) {
    super(...args);
    const { campaignId } = this.args;

    const adapter = this.store.adapterFor('campaign-stats');
    adapter.getParticipationsByStatus(campaignId).then((response) => {
      const { started, completed, shared } = response.data.attributes;
      this.data = {
        labels: [
          this.intl.t('charts.participants-by-status.labels.started'),
          this.intl.t('charts.participants-by-status.labels.finished'),
          this.intl.t('charts.participants-by-status.labels.shared'),
        ],
        datasets: [
          {
            data: [started, completed, shared],
            backgroundColor: ['#0090d7', '#502ec4', '#67bb0b'],
          },
        ],
      };
    });
  }

  get options() {
    return {
      responsive: true,
      plugins: {
        legend: false,
      },
      borderWidth: 0,
    };
  }
}
