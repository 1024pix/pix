import SecuredRouteMixin from 'mon-pix/mixins/secured-route-mixin';
import Route from '@ember/routing/route';

export default class ResumeRoute extends Route.extend(SecuredRouteMixin) {

  competenceId = null;

  model(params, transition) {
    const competenceId = transition.to.parent.params.competence_id;
    return this.store.queryRecord('competenceEvaluation', { competenceId, startOrResume: true });
  }

  afterModel(competenceEvaluation) {
    return this.replaceWith('assessments.resume', competenceEvaluation.get('assessment.id'));
  }
}
