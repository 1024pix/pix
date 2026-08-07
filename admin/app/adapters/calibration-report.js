import ApplicationAdapter from './application';

export default class CalibrationReportAdapter extends ApplicationAdapter {
  createRecord(store, type, snapshot) {
    if (!snapshot.adapterOptions.calibrationId) {
      return super.createRecord(...arguments);
    }

    const url = `${this.host}/${this.namespace}/certification-versions/${snapshot.adapterOptions.versionId}/calibration-report`;
    const payload = {
      data: {
        attributes: {
          calibrationId: snapshot.adapterOptions.calibrationId,
        },
      },
    };

    return this.ajax(url, 'POST', { data: payload });
  }
}
