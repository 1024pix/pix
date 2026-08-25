import ApplicationAdapter from './application';

export default class CalibrationScoringConfigurationAdapter extends ApplicationAdapter {
  urlForQueryRecord(query) {
    const url = `${this.host}/${this.namespace}/calibrations/${query.calibrationId}/scoring-configuration`;
    delete query.calibrationId;
    return url;
  }
}
