import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  shouldBackgroundReloadRecord() {
    return false;
  },

  queryRecord() {
    const url = this.buildURL('user', 'me');
    return this.ajax(url, 'GET');
  },

  findRecord() {
    const url = this.buildURL('user', 'me');
    return this.ajax(url, 'GET');
  }

});
