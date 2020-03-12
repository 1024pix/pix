import Route from '@ember/routing/route';

export default class UpdateRoute extends Route {

  model(params) {
    return this.store.findRecord('campaign', params.campaign_id);
  }

  setupController() {
    super.setupController(...arguments);
    const [controller, model] = arguments;
    controller.set('campaignName', model.name);
  }

  deactivate() {
    this.controller.model.rollbackAttributes();
  }
}
