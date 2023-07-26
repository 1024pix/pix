import { service } from '@ember/service';
import Route from '@ember/routing/route';

export default class ResumeRoute extends Route {
  @service store;
  @service router;

  competenceId = null;

  model(params, transition) {
    const competenceId = transition.to.parent.params.competence_id;
    return this.store.queryRecord('competenceEvaluation', { competenceId, startOrResume: true });
  }

  async afterModel(competenceEvaluation) {
    const assessment = await competenceEvaluation.assessment;
    return this.router.replaceWith('assessments.resume', assessment.id);
  }
}
