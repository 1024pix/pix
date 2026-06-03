import ApplicationAdapter from './application';

export default class Training extends ApplicationAdapter {
  urlForQuery(query, ...args) {
    if (query.userId) {
      const { userId } = query;
      delete query.userId;
      return `${this.host}/${this.namespace}/users/${userId}/trainings`;
    }
    return super.urlForQuery(query, ...args);
  }

  updateRelevance({ campaignParticipationId, trainingId, isRelevant }) {
    const url = `${this.host}/${this.namespace}/campaign-participations/${campaignParticipationId}/trainings/${trainingId}`;
    return this.ajax(url, 'PATCH', {
      data: {
        data: {
          attributes: {
            'is-relevant': isRelevant,
          },
        },
      },
    });
  }
}
