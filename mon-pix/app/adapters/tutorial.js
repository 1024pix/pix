import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  findAll() {
    const url = `${this.host}/${this.namespace}/users/me/tutorials`;
    return this.ajax(url, 'GET');
  },

});
