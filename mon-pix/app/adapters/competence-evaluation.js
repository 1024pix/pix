import classic from 'ember-classic-decorator';
import ApplicationAdapter from './application';

@classic
export default class CompetenceEvaluation extends ApplicationAdapter {
  urlForQueryRecord(query) {
    if (query.startOrResume) {
      delete query.startOrResume;
      return `${super.urlForQueryRecord(...arguments)}/start-or-resume`;
    }

    return super.urlForQueryRecord(...arguments);
  }

  queryRecord(store, type, query) {
    if (query.startOrResume) {
      const url = this.buildURL(type.modelName, null, null, 'queryRecord', query);

      return this.ajax(url, 'POST', { data: { competenceId: query.competenceId } });
    }

    return super.queryRecord(...arguments);
  }
}
