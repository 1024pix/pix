import Controller from '@ember/controller';

export default class AuthenticatedCampaignsCampaignController extends Controller {
  get previousRouteName() {
    return this.isComingFromAllCampaignPage ? 'authenticated.campaigns.list.all-campaigns' : 'authenticated.campaigns';
  }
}
