import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  refreshCacheEntries() {
    const url = `${this.host}/${this.namespace}/cache`;
    return this.ajax(url, 'PATCH');
  }

});
