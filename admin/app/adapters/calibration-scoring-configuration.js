import ApplicationAdapter from './application';

export default class CalibrationScoringConfigurationAdapter extends ApplicationAdapter {
  urlForQueryRecord(query) {
    const url = `${this.host}/${this.namespace}/certification-versions/${query.versionId}/calibrations/${query.calibrationId}/scoring-configuration`;
    delete query.versionId;
    delete query.calibrationId;
    return url;
  }
}
