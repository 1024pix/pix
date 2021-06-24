import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import sumBy from 'lodash/sumBy';
import { TOOLTIP_CONFIG } from './chart';

export default class ParticipantsByStatus extends Component {
  @service store;
  @service intl;

  @tracked datasets = [];
  @tracked total = 0;
  @tracked loading = true;

  constructor(...args) {
    super(...args);
    const { campaignId, isTypeAssessment } = this.args;

    const adapter = this.store.adapterFor('campaign-stats');

    adapter.getParticipationsByStatus(campaignId).then((response) => {
      const entries = Object.entries(response.data.attributes);
      this.total = sumBy(entries, ([_, count]) => count);

      this.datasets = entries.map(([key, count]) => {
        const datasetLabels = this.getDatasetLabels(key, count, isTypeAssessment);
        return { key, count, ...datasetLabels };
      });

      this.loading = false;
    });
  }

  get data() {
    return {
      labels: this.datasets.map((data) => data.tooltip),
      datasets: [
        {
          data: this.datasets.map((data) => data.count),
          backgroundColor: this.datasets.map((data) => data.color),
        },
      ],
    };
  }

  get options() {
    return {
      animation: false,
      maintainAspectRatio: false,
      plugins: {
        legend: false,
        tooltip: {
          ...TOOLTIP_CONFIG,
          callbacks: { label: (data) => data.label },
        },
      },
      borderWidth: 0,
    };
  }

  getDatasetLabels(key, count, isTypeAssessment) {
    const datasetLabels = isTypeAssessment ? LABELS_ASSESSMENT[key] : LABELS_PROFILE_COLLECTIONS[key];
    const percentage = this.total !== 0 ? count / this.total : 0;

    return {
      tooltip: this.intl.t(datasetLabels.tooltip, { percentage }),
      legend: this.intl.t(datasetLabels.legend, { count }),
      legendTooltip: this.intl.t(datasetLabels.legendTooltip, { count }),
      a11y: this.intl.t(datasetLabels.a11y, { count }),
      color: datasetLabels.color,
    };
  }
}

const LABELS_ASSESSMENT = {
  started: {
    tooltip: 'charts.participants-by-status.labels-tooltip.started',
    legend: 'charts.participants-by-status.labels-legend.started',
    legendTooltip: 'charts.participants-by-status.labels-legend.started-tooltip',
    a11y: 'charts.participants-by-status.labels-a11y.started',
    color: '#FFBE00',
  },
  completed: {
    tooltip: 'charts.participants-by-status.labels-tooltip.completed',
    legend: 'charts.participants-by-status.labels-legend.completed',
    legendTooltip: 'charts.participants-by-status.labels-legend.completed-tooltip',
    a11y: 'charts.participants-by-status.labels-a11y.completed',
    color: '#8a49ff',
  },
  shared: {
    tooltip: 'charts.participants-by-status.labels-tooltip.shared',
    legend: 'charts.participants-by-status.labels-legend.shared',
    legendTooltip: 'charts.participants-by-status.labels-legend.shared-tooltip',
    a11y: 'charts.participants-by-status.labels-a11y.shared',
    color: '#038a25',
  },
};

const LABELS_PROFILE_COLLECTIONS = {
  started: {
    tooltip: 'charts.participants-by-status.labels-tooltip.started',
    legend: 'charts.participants-by-status.labels-legend.started',
    legendTooltip: 'charts.participants-by-status.labels-legend.started-tooltip',
    a11y: 'charts.participants-by-status.labels-a11y.started',
    color: '#FFBE00',
  },
  completed: {
    tooltip: 'charts.participants-by-status.labels-tooltip.completed',
    legend: 'charts.participants-by-status.labels-legend.completed',
    legendTooltip: 'charts.participants-by-status.labels-legend.completed-profile-tooltip',
    a11y: 'charts.participants-by-status.labels-a11y.completed',
    color: '#8a49ff',
  },
  shared: {
    tooltip: 'charts.participants-by-status.labels-tooltip.shared-profile',
    legend: 'charts.participants-by-status.labels-legend.shared-profile',
    legendTooltip: 'charts.participants-by-status.labels-legend.shared-profile-tooltip',
    a11y: 'charts.participants-by-status.labels-a11y.shared-profile',
    color: '#038a25',
  },
};
