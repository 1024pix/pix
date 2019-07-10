import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  urlForCreateRecord(modelName, { adapterOptions }) {
    if (adapterOptions.createMembershipsWithEmail) {
      delete adapterOptions.createMembershipsWithEmail;
      return `${this.host}/${this.namespace}/organizations/${adapterOptions.organizationId}/add-membership`;
    }

    return this._super(...arguments);
  },

  createRecord(store, type, snapshot) {
    if (snapshot.adapterOptions.createMembershipsWithEmail) {
      const url = this.buildURL(type.modelName, null, snapshot, 'createRecord');
      return this.ajax(url, 'POST', { data: { email: snapshot.adapterOptions.email } });
    }

    return this._super(...arguments);
  },
});
