import Route from '@ember/routing/route';

export default class UpdateRoute extends Route {

  model(params) {
    return this.store.findRecord('campaign', params.campaign_id);
  }

  setupController(controller, model) {
    super.setupController(controller, model);
    controller.campaignName = model.name;
  }

  resetController(controller) {
    controller.model.rollbackAttributes();
  }
}
