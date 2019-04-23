import Route from '@ember/routing/route';

export default Route.extend({

  afterModel(assessment) {
    return this.store
      .createRecord('assessment-result', { assessment })
      .save()
      .finally(() => {
        switch (assessment.get('type')) {
          case 'CERTIFICATION':
            return this.replaceWith('certifications.results', assessment.get('certificationNumber'));

          case 'SMART_PLACEMENT':
            return this.replaceWith('campaigns.skill-review', assessment.get('codeCampaign'), assessment.get('id'));

          case 'COMPETENCE_EVALUATION':
            return this.replaceWith('competences.results');

          default:
            return this.replaceWith('assessments.results', assessment.get('id'));
        }
      });
  },
});
