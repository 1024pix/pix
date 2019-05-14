import Route from '@ember/routing/route';

export default Route.extend({

  afterModel(assessment) {
    return this.store
      .createRecord('assessment-result', { assessment })
      .save()
      .finally(() => {
        switch (assessment.type) {
          case 'CERTIFICATION':
            return this.replaceWith('certifications.results', assessment.certificationNumber);

          case 'SMART_PLACEMENT':
            return this.replaceWith('campaigns.skill-review', assessment.codeCampaign, assessment.id);

          case 'COMPETENCE_EVALUATION':
            return this.replaceWith('competences.results', assessment.id);

          default:
            return this.replaceWith('assessments.results', assessment.id);
        }
      });
  },
});
