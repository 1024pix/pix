import Route from '@ember/routing/route';

export default Route.extend({

  model() {
    const competenceEvaluation = this.modelFor('competence');
    const assessment = this.modelFor('competence.assessment');

    return { competenceEvaluation, assessment };
  },

  async afterModel(model) {
    return model.assessment.belongsTo('progression').reload();
  },

});
