import Route from '@ember/routing/route';

export default Route.extend({

  afterModel(assessment) {

    return this.get('store')
      .createRecord('assessment-result', { assessment })
      .save()
      .finally(() => {
        switch (assessment.get('type')) {
          case 'CERTIFICATION':
            return this.replaceWith('certifications.results', assessment.get('certificationNumber'));

          case 'SMART_PLACEMENT':
            return this.replaceWith('campaigns.skill-review', assessment.get('id'));

          default:
            return this.replaceWith('assessments.results', assessment.get('id'));
        }
      });
  },
});
