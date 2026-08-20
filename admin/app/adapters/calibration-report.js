import ApplicationAdapter from './application';

export default class CalibrationReportAdapter extends ApplicationAdapter {
  urlForQueryRecord(query) {
    const url = `${this.host}/${this.namespace}/certification-versions/${query.versionId}/calibrations/${query.calibrationId}/report`;
    delete query.versionId;
    delete query.calibrationId;
    return url;
  }
}
