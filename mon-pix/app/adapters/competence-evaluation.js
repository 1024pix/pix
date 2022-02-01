import ApplicationAdapter from './application';

export default class CompetenceEvaluation extends ApplicationAdapter {
  urlForFindAll(modelName, { adapterOptions }) {
    const url = super.urlForFindAll(...arguments);

    if (adapterOptions && adapterOptions.assessmentId) {
      const assessmentId = adapterOptions.assessmentId;
      delete adapterOptions.assessmentId;
      return `${this.host}/${this.namespace}/assessments/${assessmentId}/competence-evaluations`;
    }

    return url;
  }

  urlForQueryRecord(query) {
    if (query.startOrResume) {
      delete query.startOrResume;
      return `${super.urlForQueryRecord(...arguments)}/start-or-resume`;
    }
    if (query.improve) {
      delete query.improve;
      return `${super.urlForQueryRecord(...arguments)}/improve`;
    }

    return super.urlForQueryRecord(...arguments);
  }

  queryRecord(store, type, query) {
    if (query.startOrResume) {
      const url = this.buildURL(type.modelName, null, null, 'queryRecord', query);

      return this.ajax(url, 'POST', { data: { competenceId: query.competenceId } });
    }
    if (query.improve) {
      const url = this.buildURL(type.modelName, null, null, 'queryRecord', query);

      return this.ajax(url, 'POST', { data: { userId: query.userId, competenceId: query.competenceId } });
    }

    return super.queryRecord(...arguments);
  }
}
