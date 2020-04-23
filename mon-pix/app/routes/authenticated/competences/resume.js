import classic from 'ember-classic-decorator';
import { inject as service } from '@ember/service';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

import Route from '@ember/routing/route';

@classic
export default class ResumeRoute extends Route.extend(AuthenticatedRouteMixin) {
  @service session;
  @service router;

  competenceId = null;

  model(params, transition) {
    const competenceId = transition.to.parent.params.competence_id;
    const competenceEvaluation = this.store.queryRecord('competenceEvaluation', { competenceId, startOrResume: true });
    return competenceEvaluation;
  }

  afterModel(competenceEvaluation) {
    return this.replaceWith('assessments.resume', competenceEvaluation.get('assessment.id'));
  }
}
