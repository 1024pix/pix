import ApplicationAdapter from './application';

export default class CalibrationReportAdapter extends ApplicationAdapter {
  urlForQueryRecord(query) {
    const url = `${this.host}/${this.namespace}/certification-versions/${query.versionId}/latest-calibration-report`;
    delete query.versionId;
    return url;
  }
}
