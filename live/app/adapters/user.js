import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  queryRecord() {
    const url = this.buildURL('user', 'me');
    return this.ajax(url, 'GET');
  }
});
