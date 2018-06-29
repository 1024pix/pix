import Route from '@ember/routing/route';

export default Route.extend({

  afterModel(assessment) {

    return this.get('store')
      .createRecord('assessment-result', { assessment })
      .save()
      .finally(() => {
        switch (assessment.get('type')) {
          case 'CERTIFICATION':
            return this.transitionTo('certifications.results', assessment.get('certificationNumber'));

          case 'SMART_PLACEMENT':
            return this.transitionTo('campaigns.skill-review', assessment.get('id'));

          default:
            return this.transitionTo('assessments.results', assessment.get('id'));
        }
      });
  },
});
