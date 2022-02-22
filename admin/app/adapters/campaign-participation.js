import ApplicationAdapter from './application';

export default class CampaignParticipations extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForQuery(query) {
    const baseUrl = this.buildURL();
    const url = `${baseUrl}/campaigns/${query.campaignId}/participations`;
    delete query.campaignId;

    return url;
  }
}
