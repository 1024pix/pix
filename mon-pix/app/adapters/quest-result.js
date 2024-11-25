import ApplicationAdapter from './application';

export default class QuestResult extends ApplicationAdapter {
  urlForQuery(query) {
    if (query.campaignParticipationId) {
      const url = `${this.host}/${this.namespace}/campaign-participations/${query.campaignParticipationId}/quest-results`;
      delete query.campaignParticipationId;
      return url;
    }
    return super.urlForQuery(...arguments);
  }
}
