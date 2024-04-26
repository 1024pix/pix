import ApplicationAdapter from './application';

export default class ScoringAndCapacitySimulatorReportAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForQueryRecord() {
    console.log('coucou');
    const baseUrl = this.buildURL();

    const url = `${baseUrl}/simulate-score-and-capacity`;

    return url;
  }
}
