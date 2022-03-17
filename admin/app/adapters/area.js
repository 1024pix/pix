import ApplicationAdapter from './application';

export default class AreaAdapter extends ApplicationAdapter {
  urlForQuery(query) {
    const baseUrl = this.buildURL();
    const url = `${baseUrl}/frameworks/${query.frameworkId}/areas`;
    delete query.frameworkId;

    return url;
  }
}
