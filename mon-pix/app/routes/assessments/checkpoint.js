import Route from '@ember/routing/route';

export default Route.extend({

  model() {
    return this.modelFor('assessments');
  },

  async afterModel(assessment) {
    if (assessment.isSmartPlacement) {
      await assessment.belongsTo('progression').reload();

      const campaigns = await this.store.query('campaign', { filter: { code: assessment.codeCampaign } });

      assessment.set('campaign', campaigns.get('firstObject'));
    }
  },

});
