import ApplicationAdapter from './application';

export default class Campaigns extends ApplicationAdapter {

  urlForQuery(query) {
    const baseUrl = this.buildURL();
    const url = `${baseUrl}/admin/organizations/${query.organizationId}/campaigns`;
    delete query.organizationId;

    return url;
  }
}
