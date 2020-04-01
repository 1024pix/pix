import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  urlForQueryRecord(query) {
    if (query.startOrResume) {
      delete query.startOrResume;
      return `${this._super(...arguments)}/start-or-resume`;
    }

    return this._super(...arguments);
  },

  queryRecord(store, type, query) {
    if (query.startOrResume) {
      const url = this.buildURL(type.modelName, null, null, 'queryRecord', query);

      return this.ajax(url, 'POST', { data: { competenceId: query.competenceId } });
    }

    return this._super(...arguments);
  },

});
