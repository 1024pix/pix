import Route from '@ember/routing/route';

export default class CertificationsRoute extends Route {
  queryParams = {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
  };

  async model({ pageSize, pageNumber }) {
    const session = await this.modelFor('authenticated.sessions.session');
    const juryCertificationSummaries = await session.juryCertificationSummaries;

    const adapterOptions = {
      'page[size]': pageSize,
      'page[number]': pageNumber,
    };
    if (juryCertificationSummaries === null) {
      juryCertificationSummaries.load({ adapterOptions });
    } else {
      juryCertificationSummaries.reload({ adapterOptions });
    }
    return {
      session,
      juryCertificationSummaries,
    };
  }
}
