import classic from 'ember-classic-decorator';
import ApplicationAdapter from './application';

@classic
export default class Scorecard extends ApplicationAdapter {
  urlForUpdateRecord(id, modelName, { adapterOptions }) {
    if (adapterOptions.resetCompetence) {
      delete adapterOptions.resetCompetence;
      return `${this.host}/${this.namespace}/users/${adapterOptions.userId}/competences/${adapterOptions.competenceId}/reset`;
    }

    return super.urlForUpdateRecord(...arguments);
  }

  updateRecord(store, type, snapshot) {
    if (snapshot.adapterOptions.resetCompetence) {
      const url = this.buildURL(type.modelName, snapshot.id, snapshot, 'updateRecord');

      return this.ajax(url, 'POST');
    }

    return super.updateRecord(...arguments);
  }
}
