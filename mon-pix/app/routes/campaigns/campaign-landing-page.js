import Route from '@ember/routing/route';

export default class CampaignLandingPageRoute extends Route {

  deactivate() {
    this.controller.set('isLoading', false);
  }

  async model() {
    return this.modelFor('campaigns');
  }
}
