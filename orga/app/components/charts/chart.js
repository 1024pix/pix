import Component from '@glimmer/component';
import { action } from '@ember/object';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

export const TOOLTIP_CONFIG = {
  backgroundColor: '#091e42',
  padding: 8,
  displayColors: false,
};

export default class EmberChart extends Component {

  constructor() {
    super(...arguments);

    this.plugins = this.plugins || [];
  }

  @action
  drawChart(element) {
    const { data, type, options, plugins } = this.args;
    const chart = new Chart(element, { type, data, options, plugins });
    this.chart = chart;
  }

  @action
  updateChart() {
    const { data, options } = this.args;
    if (this.chart) {
      this.chart.data = data;
      this.chart.options = options;
      this.chart.update();

      if (this.customLegendElement) {
        this.customLegendElement.innerHTML = this.chart.generateLegend();
      }
    }
  }

  willDestroy() {
    this.chart.destroy();
    super.willDestroy();
  }
}
