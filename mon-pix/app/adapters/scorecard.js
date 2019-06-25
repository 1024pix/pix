import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({

  urlForUpdateRecord(id, modelName, { adapterOptions }) {
    if (adapterOptions.resetCompetence) {
      delete adapterOptions.resetCompetence;
      return `${this.host}/${this.namespace}/users/${adapterOptions.userId}/competences/${adapterOptions.competenceId}/reset`;
    }

    return this._super(...arguments);
  }
});
