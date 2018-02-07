import Route from '@ember/routing/route';

export default Route.extend({

  afterModel(assessment) {
    this.get('store').createRecord('assessment-rating', { assessment }).save();

    assessment.get('type') === 'CERTIFICATION' ?
      this.transitionTo('certifications.results', assessment.get('certificationNumber'))
      : this.transitionTo('assessments.results', assessment.get('id'));
  }

});
