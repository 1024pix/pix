import ApplicationAdapter from './application';

export default class ScoringAndCapacitySimulatorReportAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForQuery() {
    const baseUrl = this.buildURL();

    const url = `${baseUrl}/${this.namespace}/simulate-score-and-capacity`;

    return url;
  }
}
