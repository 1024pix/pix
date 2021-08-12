import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import moment from 'moment';
import { TOOLTIP_CONFIG, LEGEND_CONFIG } from '../../ui/chart';
import locales from 'date-fns/locale';

export default class ParticipantsByDay extends Component {
  @service store;
  @service intl;
  @tracked days = 0;
  @tracked startedDatasets = [];
  @tracked sharedDatasets = [];

  @tracked loading = true;

  constructor(...args) {
    super(...args);
    const { campaignId } = this.args;

    this.isTypeAssessment = this.args.isTypeAssessment;
    const adapter = this.store.adapterFor('campaign-stats');

    adapter.getParticipationsByDay(campaignId).then((response) => {
      const { 'started-participations': startedParticipations, 'shared-participations': sharedParticipations } = response.data.attributes;

      if (startedParticipations.length > 0) {
        this.days = moment(startedParticipations[startedParticipations.length - 1].day).diff(moment(startedParticipations[0].day), 'days');
      }

      this.sharedDatasets = sharedParticipations;
      this.startedDatasets = startedParticipations;

      this.loading = false;
    });
  }

  get labels() {
    return this.isTypeAssessment ? LABELS_ASSESSMENT : LABELS_PROFILE_COLLECTIONS;
  }

  get data() {
    return {
      datasets: [
        {
          label: this.intl.t(this.labels.started.legend),
          data: this.startedDatasets,
          borderColor: '#3d68ff',
          backgroundColor: '#3d68ff',
          tension: 0.2,
          pointStyle: 'circle',
        },
        {
          label: this.intl.t(this.labels.shared.legend),
          data: this.sharedDatasets,
          borderColor: '#038a25',
          backgroundColor: '#038a25',
          tension: 0.2,
          pointStyle: 'rect',
        },
      ],
    };
  }

  get options() {
    const locale = locales[this.intl.locale[0]];
    return {
      locale: this.intl.locale,
      parsing: {
        xAxisKey: 'day',
        yAxisKey: 'count',
      },
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        xAxes: {
          grid: {
            display: false,
          },
          type: 'time',
          time: {
            minUnit: 'day',
            unit: this.days > 90 ? 'month' : false,
            tooltipFormat: 'dd LLLL',
          },
          adapters: {
            date: {
              locale,
            },
          },
        },
        yAxes: {
          grid: {
            borderDash: [4, 4],
          },
          min: 0,
          ticks: {
            precision: 0,
          },
        },
      },
      plugins: {
        tooltip: {
          ...TOOLTIP_CONFIG,
        },
        legend: {
          ...LEGEND_CONFIG,
        },
      },
    };
  }

  get datasets() {
    let startedLabel = '';
    let sharedLabel = '';

    if (this.isTypeAssessment) {
      startedLabel = LABELS_ASSESSMENT.started.a11y;
      sharedLabel = LABELS_ASSESSMENT.shared.a11y;
    } else {
      startedLabel = LABELS_PROFILE_COLLECTIONS.started.a11y;
      sharedLabel = LABELS_PROFILE_COLLECTIONS.shared.a11y;
    }

    return [
      { entries: this.startedDatasets, countLabel: startedLabel },
      { entries: this.sharedDatasets, countLabel: sharedLabel },
    ];
  }
}

const LABELS_ASSESSMENT = {
  started: {
    legend: 'charts.participants-by-day.labels-legend.started',
    a11y: 'charts.participants-by-day.labels-a11y.started',
  },
  shared: {
    legend: 'charts.participants-by-day.labels-legend.shared',
    a11y: 'charts.participants-by-day.labels-a11y.shared',
  },
};

const LABELS_PROFILE_COLLECTIONS = {
  started: {
    legend: 'charts.participants-by-day.labels-legend.started',
    a11y: 'charts.participants-by-day.labels-a11y.started',
  },
  shared: {
    legend: 'charts.participants-by-day.labels-legend.shared-profile',
    a11y: 'charts.participants-by-day.labels-a11y.shared-profile',
  },
};
