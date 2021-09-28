import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class ResumeRoute extends Route {
  @service session;
  @service router;

  competenceId = null;

  beforeModel(transition) {
    this.session.requireAuthenticationAndApprovedTermsOfService(transition);
  }

  model(params, transition) {
    const competenceId = transition.to.parent.params.competence_id;
    return this.store.queryRecord('competenceEvaluation', { competenceId, startOrResume: true });
  }

  afterModel(competenceEvaluation) {
    return this.replaceWith('assessments.resume', competenceEvaluation.get('assessment.id'));
  }
}
