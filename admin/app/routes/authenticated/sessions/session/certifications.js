import Route from '@ember/routing/route';

export default class CertificationsRoute extends Route {
  queryParams = {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
  };

  async model({ pageSize, pageNumber }) {
    const session = this.modelFor('authenticated.sessions.session');
    const juryCertificationSummaries = session.hasMany('juryCertificationSummaries');

    const adapterOptions = {
      'page[size]': pageSize,
      'page[number]': pageNumber,
    };
    if (juryCertificationSummaries.value() === null) {
      juryCertificationSummaries.load({ adapterOptions });
    } else {
      juryCertificationSummaries.reload({ adapterOptions });
    }
    return session;
  }
}
