import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import Route from '@ember/routing/route';

export default Route.extend(AuthenticatedRouteMixin, {

  session: service(),
  competenceId: null,
  campaign: null,
  //userHasJustConsultedTutorial: false,
  authenticationRoute: 'inscription',

  beforeModel(transition) {
    this.set('competenceId', transition.to.params.competence_id);
    //this.set('userHasJustConsultedTutorial', transition.to.queryParams.hasJustConsultedTutorial);

    //if (this._userIsUnauthenticated() && !this.userHasSeenLanding) {
    //  return this.transitionTo('campaigns.campaign-landing-page', this.competenceId);
    //}
    this._super(...arguments);
  },

  model() {
    return this.store.createRecord('competenceEvaluation', { competenceId: this.competenceId }).save();
  },

  afterModel(competenceEvaluation) {
    return this.transitionTo('assessments.resume', competenceEvaluation.get('assessment.id'));
  },

  _userIsUnauthenticated() {
    return this.get('session.isAuthenticated') === false;
  },

  _thereIsNoAssessment(assessments) {
    return isEmpty(assessments);
  }

});
