import { inject as service } from '@ember/service';
import Route from '@ember/routing/route';

export default class ResumeRoute extends Route {
  @service session;
  @service store;
  @service router;
  @service currentUser;

  competenceId = null;

  beforeModel(transition) {
    const isUserLoaded = !!this.currentUser.user;
    const isAuthenticated = this.session.get('isAuthenticated');
    if (!isAuthenticated || !isUserLoaded) {
      this.session.set('attemptedTransition', transition);
      this.router.transitionTo('login');
    } else if (this.currentUser.user.mustValidateTermsOfService) {
      this.session.set('attemptedTransition', transition);
      this.router.transitionTo('terms-of-service');
    } else {
      return super.beforeModel(...arguments);
    }
  }

  model(params, transition) {
    const competenceId = transition.to.parent.params.competence_id;
    return this.store.queryRecord('competenceEvaluation', { competenceId, startOrResume: true });
  }

  afterModel(competenceEvaluation) {
    return this.router.replaceWith('assessments.resume', competenceEvaluation.get('assessment.id'));
  }
}
