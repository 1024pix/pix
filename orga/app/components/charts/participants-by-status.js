import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';

export default class ParticipantsByStatus extends Component {
  @service store;
  @service intl;

  @tracked data = {};
  @tracked loading = true;

  constructor(...args) {
    super(...args);
    const { campaignId } = this.args;

    const adapter = this.store.adapterFor('campaign-stats');
    adapter.getParticipationsByStatus(campaignId).then((response) => {
      const { started, completed, shared } = response.data.attributes;
      this.data = {
        labels: [
          this.intl.t('charts.participants-by-status.labels.started'),
          this.intl.t('charts.participants-by-status.labels.completed'),
          this.intl.t('charts.participants-by-status.labels.shared'),
        ],
        datasets: [
          {
            data: [started, completed, shared],
            backgroundColor: ['#0090d7', '#502ec4', '#67bb0b'],
          },
        ],
      };
      this.loading = false;
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

  get started() {
    return this.data.datasets[0].data[0];
  }

  get completed() {
    return this.data.datasets[0].data[1];
  }

  get shared() {
    return this.data.datasets[0].data[2];
  }
}
