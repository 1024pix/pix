import Route from '@ember/routing/route';

export default Route.extend({

  async model(params) {
    const assessment = await this.get('store').findRecord('assessment', params.assessment_id);
    const [campaigns] = await Promise.all([
      this.get('store').query('campaign', { filter: { code: assessment.codeCampaign } }),
      assessment.belongsTo('smartPlacementProgression').reload(),
      assessment.hasMany('answers').reload(),
    ]);
    assessment.set('campaign', campaigns.get('firstObject'));
    return assessment;

  },

});
