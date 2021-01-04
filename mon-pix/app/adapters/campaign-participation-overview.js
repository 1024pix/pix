import ApplicationAdapter from './application';

export default class CampaignParticipationOverview extends ApplicationAdapter {

  urlForQuery(query) {
    const baseUrl = this.buildURL();
    const url = `${baseUrl}/users/${query.userId}/campaign-participation-overviews`;

    delete query.userId;

    return url;
  }
}
