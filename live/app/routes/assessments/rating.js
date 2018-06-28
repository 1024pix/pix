import Route from '@ember/routing/route';

export default Route.extend({

  afterModel(assessment) {
    this.get('store').createRecord('assessment-result', { assessment }).save();

    switch (assessment.get('type')) {
      case 'CERTIFICATION':
        this.transitionTo('certifications.results', assessment.get('certificationNumber'));
        break;

      case 'SMART_PLACEMENT':
        this.transitionTo('campaigns.skill-review', assessment.get('id'));
        break;

      default:
        this.transitionTo('assessments.results', assessment.get('id'));
    }
  }

});
