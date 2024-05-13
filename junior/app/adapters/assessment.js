import ApplicationAdapter from './application';

export default class AssessmentAdapter extends ApplicationAdapter {
  queryRecord(store, type, query) {
    const url = this.buildURL(type.modelName, null, null, 'queryRecord', query);
    return this.ajax(url, 'POST', {
      data: {
        missionId: query.missionId,
        learnerId: query.learnerId,
      },
    });
  }
  urlForCreateRecord() {
    return `${this.host}/${this.namespace}/assessments/preview`;
  }
}
