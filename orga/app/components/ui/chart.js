import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm.js';

import { guidFor } from '@ember/object/internals';
import { service } from '@ember/service';
import Component from '@glimmer/component';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

export const TOOLTIP_CONFIG = {
  backgroundColor: '#091e42',
  padding: 8,
  displayColors: false,
};

export const LEGEND_CONFIG = {
  position: 'bottom',
  align: 'start',
  labels: {
    boxWidth: 10,
    boxHeight: 10,
    usePointStyle: true,
    color: '#344563',
    padding: 20,
    font: {
      family: 'Roboto',
      size: 14,
    },
  },
  onClick: null,
};

export default class EmberChart extends Component {
  @service elementHelper;

  constructor(...args) {
    super(...args);
    this.chartId = 'chart-' + guidFor(this);
    this.plugins = this.plugins || [];

    this.elementHelper.waitForElement(this.chartId).then((element) => {
      const { data, type, options, plugins } = this.args;
      this.chart = new Chart(element, { type, data, options, plugins });
    });
  }

  willDestroy() {
    this.chart.destroy();
    super.willDestroy();
  }
}
