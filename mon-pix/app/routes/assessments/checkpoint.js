import Route from '@ember/routing/route';

export default Route.extend({

  async afterModel(assessment) {

    if (assessment.isCompetenceEvaluation || assessment.isSmartPlacement) {
      await assessment.belongsTo('progression').reload();
    }

    if (assessment.isSmartPlacement) {
      const campaigns = await this.store.query('campaign', { filter: { code: assessment.codeCampaign } });

      assessment.set('campaign', campaigns.get('firstObject'));
    }
  },

});
