import Route from '@ember/routing/route';

export default class RedirectToCampaign extends Route {
  async beforeModel(transition) {
    const { masteryPercentage } = transition.to.queryParams;
    if (masteryPercentage <= 10 || !transition.to.queryParams.masteryPercentage) {
      await this.transitionTo('campaigns', 'PROCOLECT');
    } else {
      await this.transitionTo('campaigns', 'PROCUSTOM');
    }
  }
}
