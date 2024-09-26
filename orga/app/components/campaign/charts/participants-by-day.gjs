import { service } from '@ember/service';
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import dayjsFormat from 'ember-dayjs/helpers/dayjs-format';
import { t } from 'ember-intl';
import maxBy from 'lodash/maxBy';
import minBy from 'lodash/minBy';

import TableHeader from '../../table/header';
import Chart from '../../ui/chart';
import { LEGEND_CONFIG, TOOLTIP_CONFIG } from '../../ui/chart';
import ChartCard from '../../ui/chart-card';
import ParticipantsByDayLoader from './participants-by-day-loader';

export default class ParticipantsByDay extends Component {
  @service store;
  @service intl;
  @service dayjs;

  @tracked days = 0;
  @tracked startedDatasets = [];
  @tracked sharedDatasets = [];
  @tracked loading = true;

  constructor(...args) {
    super(...args);

    const adapter = this.store.adapterFor('campaign-stats');
    adapter.getParticipationsByDay(this.args.campaignId).then((response) => {
      const { 'started-participations': startedParticipations, 'shared-participations': sharedParticipations } =
        response.data.attributes;

      if (startedParticipations.length > 0) {
        this.days = this.dayjs
          .self(startedParticipations[startedParticipations.length - 1].day)
          .diff(this.dayjs.self(startedParticipations[0].day), 'days');
      }

      const { startedDatasets, sharedDatasets } = this._normalizeDatasets(startedParticipations, sharedParticipations);

      this.startedDatasets = startedDatasets;
      this.sharedDatasets = sharedDatasets;
      this.loading = false;
    });
  }

  _normalizeDatasets(startedParticipations, sharedParticipations) {
    const startedDatasets = [...startedParticipations];
    const sharedDatasets = [...sharedParticipations];

    if (startedDatasets.length > 0 && sharedDatasets.length > 0) {
      _setMinBoundary(startedDatasets, sharedDatasets);
      _setMaxBoundary(startedDatasets, sharedDatasets);
    }

    return { startedDatasets, sharedDatasets };
  }

  get labels() {
    return this.args.isTypeAssessment ? LABELS_ASSESSMENT : LABELS_PROFILE_COLLECTIONS;
  }

  get data() {
    return {
      datasets: [
        {
          label: this.intl.t(this.labels.started.legend),
          data: this.startedDatasets,
          borderColor: '#613fdd',
          backgroundColor: '#613fdd',
          tension: 0.2,
          pointStyle: 'circle',
          order: 2,
        },
        {
          label: this.intl.t(this.labels.shared.legend),
          data: this.sharedDatasets,
          borderColor: '#038a25',
          backgroundColor: '#038a25',
          tension: 0.2,
          pointStyle: 'rect',
          order: 1,
        },
      ],
    };
  }

  get options() {
    return {
      parsing: {
        xAxisKey: 'day',
        yAxisKey: 'count',
      },
      animation: false,
      responsive: true,
      maintainAspectRatio: false,
      locale: this.intl.primaryLocale,
      scales: {
        x: {
          grid: {
            display: false,
          },
          type: 'time',
          time: {
            minUnit: 'day',
            unit: this.days > 90 ? 'month' : false,
            tooltipFormat: 'DD MMMM',
            displayFormats: {
              month: 'MMM YYYY',
              day: 'DD MMM',
            },
          },
        },
        y: {
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
    let startedCaption = '';
    let sharedCaption = '';

    if (this.args.isTypeAssessment) {
      startedCaption = LABELS_ASSESSMENT.started.caption;
      startedLabel = LABELS_ASSESSMENT.started.a11y;
      sharedCaption = LABELS_ASSESSMENT.shared.caption;
      sharedLabel = LABELS_ASSESSMENT.shared.a11y;
    } else {
      startedCaption = LABELS_PROFILE_COLLECTIONS.started.caption;
      startedLabel = LABELS_PROFILE_COLLECTIONS.started.a11y;
      sharedCaption = LABELS_PROFILE_COLLECTIONS.shared.caption;
      sharedLabel = LABELS_PROFILE_COLLECTIONS.shared.a11y;
    }

    return [
      { caption: startedCaption, entries: this.startedDatasets, countLabel: startedLabel },
      { caption: sharedCaption, entries: this.sharedDatasets, countLabel: sharedLabel },
    ];
  }

  <template>
    <ChartCard @title={{t "charts.participants-by-day.title"}} ...attributes>
      {{#if this.loading}}
        <ParticipantsByDayLoader />
      {{else}}
        <Chart
          @type="line"
          @options={{this.options}}
          @data={{this.data}}
          aria-hidden="true"
          class="participants-by-day"
        />

        {{#each this.datasets as |dataset|}}
          <table class="screen-reader-only">
            <caption>{{t dataset.caption}}</caption>
            <thead>
              <tr>
                <TableHeader>{{t "charts.participants-by-day.labels-a11y.date"}}</TableHeader>
                <TableHeader>{{t dataset.countLabel}}</TableHeader>
              </tr>
            </thead>
            <tbody>
              {{#each dataset.entries as |entry|}}
                <tr>
                  <td>{{dayjsFormat entry.day "DD/MM/YYYY"}}</td>
                  <td>{{entry.count}}</td>
                </tr>
              {{/each}}
            </tbody>
          </table>
        {{/each}}
      {{/if}}
    </ChartCard>
  </template>
}

const LABELS_ASSESSMENT = {
  started: {
    caption: 'charts.participants-by-day.captions.started',
    legend: 'charts.participants-by-day.labels-legend.started',
    a11y: 'charts.participants-by-day.labels-a11y.started',
  },
  shared: {
    caption: 'charts.participants-by-day.captions.shared',
    legend: 'charts.participants-by-day.labels-legend.shared',
    a11y: 'charts.participants-by-day.labels-a11y.shared',
  },
};

const LABELS_PROFILE_COLLECTIONS = {
  started: {
    caption: 'charts.participants-by-day.captions.started',
    legend: 'charts.participants-by-day.labels-legend.started',
    a11y: 'charts.participants-by-day.labels-a11y.started',
  },
  shared: {
    caption: 'charts.participants-by-day.captions.shared-profile',
    legend: 'charts.participants-by-day.labels-legend.shared-profile',
    a11y: 'charts.participants-by-day.labels-a11y.shared-profile',
  },
};

function _setMinBoundary(startedDatasets, sharedDatasets) {
  const firstStarted = minBy(startedDatasets, 'day');
  const firstShared = minBy(sharedDatasets, 'day');

  if (new Date(firstShared.day) > new Date(firstStarted.day)) {
    sharedDatasets.unshift({ day: firstStarted.day, count: '0' });
  }
}

function _setMaxBoundary(startedDatasets, sharedDatasets) {
  const lastStarted = maxBy(startedDatasets, 'day');
  const lastShared = maxBy(sharedDatasets, 'day');

  if (new Date(lastShared.day) > new Date(lastStarted.day)) {
    startedDatasets.push({ day: lastShared.day, count: lastStarted.count });
  }
  if (new Date(lastShared.day) < new Date(lastStarted.day)) {
    sharedDatasets.push({ day: lastStarted.day, count: lastShared.count });
  }
}
