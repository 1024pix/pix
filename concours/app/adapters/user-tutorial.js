import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  createRecord(store, type, { adapterOptions }) {
    const url = `${this.host}/${this.namespace}/users/me/tutorials/${adapterOptions.tutorialId}`;
    return this.ajax(url, 'PUT');
  },

});
