import ApplicationAdapter from './application';

export default class ScoringAndCapacitySimulatorReportAdapter extends ApplicationAdapter {
  getSimulatorResult({ score, capacity, date }) {
    let data;
    if (score) {
      data = { score, date };
    } else if (capacity) {
      data = { capacity, date };
    }
    const url = `${this.host}/${this.namespace}/simulate-score-or-capacity`;
    return this.ajax(url, 'POST', {
      data: { data },
    });
  }
}
