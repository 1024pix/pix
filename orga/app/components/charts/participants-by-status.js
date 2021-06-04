import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { TOOLTIP_CONFIG } from './chart';

export default class ParticipantsByStatus extends Component {
  @service store;
  @service intl;

  @tracked data = {};
  @tracked total = 0;
  @tracked loading = true;

  constructor(...args) {
    super(...args);
    const { campaignId } = this.args;

    const adapter = this.store.adapterFor('campaign-stats');
    adapter.getParticipationsByStatus(campaignId).then((response) => {
      const { started, completed, shared } = response.data.attributes;

      this.total = started + completed + shared;
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
      animation: false,
      responsive: true,
      plugins: {
        legend: false,
        tooltip: {
          ...TOOLTIP_CONFIG,
          callbacks: {
            label: (data) => this.getTooltipLabel(data),
          },
        },
      },
      borderWidth: 0,
    };
  }

  get started() {
    if (!this.data.datasets) return 0;
    return this.data.datasets[0].data[0];
  }

  get completed() {
    if (!this.data.datasets) return 0;
    return this.data.datasets[0].data[1];
  }

  get shared() {
    if (!this.data.datasets) return 0;
    return this.data.datasets[0].data[2];
  }

  getTooltipLabel({ label, raw }) {
    const value = this.total !== 0 ? raw / this.total : 0;
    return this.intl.t('charts.participants-by-status.tooltip', { label, value });
  }
}
