import ApplicationAdapter from './application';
import queryString from 'query-string';

export default class TargetProfileAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  findHasMany(store, snapshot, url, relationship) {
    if (relationship.type === 'organization' && snapshot.adapterOptions) {
      const options = queryString.stringify(snapshot.adapterOptions);
      url += '?' + options;
      return this.ajax(url, 'GET');
    }
  }
}
