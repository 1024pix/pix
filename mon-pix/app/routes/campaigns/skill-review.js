import RSVP from 'rsvp';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import Route from '@ember/routing/route';

export default Route.extend(AuthenticatedRouteMixin, {

  model(params) {
    const store = this.store;
    const assessmentId = params.assessment_id;
    return RSVP.hash({
      campaignParticipation: store.query('campaignParticipation', { filter: { assessmentId } })
        .then((campaignParticipations) => campaignParticipations.get('firstObject')),
      assessment: store.findRecord('assessment', assessmentId)
    });
  },

  afterModel(model) {
    if (model.campaignParticipation.isShared) {
      this.controllerFor('campaigns.skill-review').send('hideShareButton');
    }
  },

  setupController(controller, model) {
    this._super(...arguments);
    if (!model.campaignParticipation.isShared) {
      controller.set('showButtonToShareResult', true);
    }
  },
});
