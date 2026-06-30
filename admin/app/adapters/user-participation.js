import ApplicationAdapter from './application';

export default class UserParticipations extends ApplicationAdapter {
  urlForDeleteRecord(id, modelName, snapshot) {
    const baseUrl = this.buildURL();
    return `${baseUrl}/campaigns/${snapshot.attr('campaignId')}/campaign-participations/${snapshot.attr('campaignParticipationId')}`;
  }
}
