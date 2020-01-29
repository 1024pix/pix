import ApplicationAdapter from './application';

export default class SessionAdapter extends ApplicationAdapter {

  finalize(model) {
    const url = `${this.buildURL('session', model.id)}/finalization`;

    // Here we try to respect the JSON-API format
    // so the API knows how to handle this payload
    return this.ajax(url, 'PUT', {
      data: {
        data: {
          attributes: {
            'examiner-global-comment': model.get('examinerGlobalComment'),
          },
          included: model.get('certificationReports')
            .filter((certificationReport) => certificationReport.hasDirtyAttributes)
            .map((certificationReport) => ({
              type: 'certification-reports',
              id: certificationReport.get('id'),
              attributes: certificationReport.toJSON(),
            })),
        },
      },
    });
  }
}
