import ApplicationAdapter from './application';

export default class TrainingSummaryAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForQuery(query) {
    if (query.targetProfileId) {
      const targetProfileId = query.targetProfileId;
      delete query.targetProfileId;
      return `${this.host}/${this.namespace}/target-profiles/${targetProfileId}/training-summaries`;
    }
    return super.urlForQuery(...arguments);
  }
}
