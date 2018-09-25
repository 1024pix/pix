import RSVP from 'rsvp';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import BaseRoute from 'mon-pix/routes/base-route';

export default BaseRoute.extend(AuthenticatedRouteMixin, {

  model(params) {
    const store = this.get('store');
    const assessmentId = params.assessment_id;

    return RSVP.hash({
      campaignParticipation: store.query('campaignParticipation', { filter: { assessmentId } })
        .then((campaignParticipations) => campaignParticipations.get('firstObject')),
      assessment: store.findRecord('assessment', assessmentId)
    });
  },
});
