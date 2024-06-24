import ApplicationAdapter from './application';

export default class ScoringAndCapacitySimulatorReportAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  getSimulatorResult({ score, capacity }) {
    let data;
    if (score) {
      data = { score };
    } else if (capacity) {
      data = { capacity };
    }
    const url = `${this.host}/${this.namespace}/simulate-score-or-capacity`;
    return this.ajax(url, 'POST', {
      data: { data },
    });
  }
}
