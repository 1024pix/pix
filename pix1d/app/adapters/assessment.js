import ApplicationAdapter from './application';

export default class AssessmentAdapter extends ApplicationAdapter {
  queryRecord(store, type, query) {
    //this.buildURL(modelName, ID/queryUrl, snapshot, requestType, query);
    const url = this.buildURL(type.modelName, null, null, 'queryRecord', query);
    return this.ajax(url, 'POST', {
      data: {
        missionId: query.missionId,
      },
    });
  }
}
