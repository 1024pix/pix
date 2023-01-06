import Controller from '@ember/controller';
import { inject as service } from '@ember/service';

export default class AuthenticatedCampaignsCampaignController extends Controller {
  @service navigation;

  get previousRouteName() {
    return this.navigation.campaignsRouteToGoBackTo || 'authenticated.campaigns';
  }
}
