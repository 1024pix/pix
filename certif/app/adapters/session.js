import ApplicationAdapter from './application';

export default class SessionAdapter extends ApplicationAdapter {

  urlForUpdateRecord(id, modelName, { adapterOptions }) {
    const url = super.urlForUpdateRecord(...arguments);
    if (adapterOptions && adapterOptions.finalization)  {
      delete adapterOptions.finalization;
      return url + '/finalization';
    }

    return url;
  }

  updateRecord(store, type, snapshot) {
    if (snapshot.adapterOptions && snapshot.adapterOptions.finalization) {
      const model = snapshot.record;
      const data = {
        data: {
          attributes: {
            'examiner-global-comment': model.examinerGlobalComment,
          },
          included: model.certificationReports
            .filter((certificationReport) => certificationReport.hasDirtyAttributes)
            .map((certificationReport) => ({
              type: 'certification-reports',
              id: certificationReport.get('id'),
              attributes: certificationReport.toJSON(),
            })),
        },
      };
      return this.ajax(this.urlForUpdateRecord(snapshot.id, type.modelName, snapshot), 'PUT', { data });
    }

    return super.updateRecord(...arguments);
  }
}
