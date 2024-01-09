import Component from '@glimmer/component';
import { service } from '@ember/service';
import { action } from '@ember/object';
import sumBy from 'lodash/sumBy';
import { TOOLTIP_CONFIG } from '../../ui/chart';
import pattern from 'patternomaly';

export default class ParticipantsByStatus extends Component {
  @service store;
  @service intl;

  get total() {
    return sumBy(this.args.participantCountByStatus, ([_, count]) => count);
  }

  get datasets() {
    return this.args.participantCountByStatus.map(([key, count]) => {
      const datasetLabels = this.getDatasetLabels(key, count, this.args.isTypeAssessment);
      return { key, count, ...datasetLabels };
    });
  }

  get data() {
    const dataInfos = {
      labels: [],
      data: [],
      backgroundColor: [],
    };

    this.datasets.forEach((data) => {
      dataInfos.labels.push(data.tooltip);
      dataInfos.data.push(data.count);
      dataInfos.backgroundColor.push(data.canvas);
    });

    return {
      labels: dataInfos.labels,
      datasets: [
        {
          data: dataInfos.data,
          backgroundColor: dataInfos.backgroundColor,
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

  @action
  setCanvas(element, params) {
    const canvas = document.createElement('canvas');
    canvas.width = 14;
    canvas.height = 14;
    canvas.className = 'participants-by-status__legend-view';
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = params[0];
    ctx.fillRect(0, 0, 14, 14);

    element.insertBefore(canvas, element.firstChild);
  }

  getDatasetLabels(key, count, isTypeAssessment) {
    const datasetLabels = isTypeAssessment ? LABELS_ASSESSMENT[key] : LABELS_PROFILE_COLLECTIONS[key];
    const percentage = this.total !== 0 ? count / this.total : 0;
    const canvas = pattern.draw(datasetLabels.shape, datasetLabels.color);

    return {
      tooltip: this.intl.t(datasetLabels.tooltip, { percentage }),
      legend: this.intl.t(datasetLabels.legend, { count }),
      legendTooltip: this.intl.t(datasetLabels.legendTooltip, { count }),
      a11y: this.intl.t(datasetLabels.a11y, { count }),
      canvas,
    };
  }
}

const LABELS_ASSESSMENT = {
  started: {
    tooltip: 'charts.participants-by-status.labels-tooltip.started',
    legend: 'charts.participants-by-status.labels-legend.started',
    legendTooltip: 'charts.participants-by-status.labels-legend.started-tooltip',
    a11y: 'charts.participants-by-status.labels-a11y.started',
    color: '#ffcb33',
    shape: 'diamond-box',
  },
  completed: {
    tooltip: 'charts.participants-by-status.labels-tooltip.completed-assessment',
    legend: 'charts.participants-by-status.labels-legend.completed-assessment',
    legendTooltip: 'charts.participants-by-status.labels-legend.completed-assessment-tooltip',
    a11y: 'charts.participants-by-status.labels-a11y.completed',
    color: '#3D68FF',
    shape: 'zigzag',
  },
  shared: {
    tooltip: 'charts.participants-by-status.labels-tooltip.shared',
    legend: 'charts.participants-by-status.labels-legend.shared',
    legendTooltip: 'charts.participants-by-status.labels-legend.shared-tooltip',
    a11y: 'charts.participants-by-status.labels-a11y.shared',
    color: '#1c825d',
    shape: 'weave',
  },
};

const LABELS_PROFILE_COLLECTIONS = {
  started: {
    tooltip: 'charts.participants-by-status.labels-tooltip.started',
    legend: 'charts.participants-by-status.labels-legend.started',
    legendTooltip: 'charts.participants-by-status.labels-legend.started-tooltip',
    a11y: 'charts.participants-by-status.labels-a11y.started',
    color: '#ffcb33',
    shape: 'diamond-box',
  },
  completed: {
    tooltip: 'charts.participants-by-status.labels-tooltip.completed-profile',
    legend: 'charts.participants-by-status.labels-legend.completed-profile',
    legendTooltip: 'charts.participants-by-status.labels-legend.completed-profile-tooltip',
    a11y: 'charts.participants-by-status.labels-a11y.completed',
    color: '#613fdd',
    shape: 'zigzag',
  },
  shared: {
    tooltip: 'charts.participants-by-status.labels-tooltip.shared-profile',
    legend: 'charts.participants-by-status.labels-legend.shared-profile',
    legendTooltip: 'charts.participants-by-status.labels-legend.shared-profile-tooltip',
    a11y: 'charts.participants-by-status.labels-a11y.shared-profile',
    color: '#1c825d',
    shape: 'weave',
  },
};
