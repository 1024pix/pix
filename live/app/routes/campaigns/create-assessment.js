import BaseRoute from 'pix-live/routes/base-route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';

export default BaseRoute.extend(AuthenticatedRouteMixin, {

  redirect() {
    const store = this.get('store');

    let assessment;

    return store.createRecord('assessment', { type: 'SMART_PLACEMENT' }).save()
      .then((createdAssessment) => assessment = createdAssessment)
      .then(() => store.queryRecord('challenge', { assessmentId: assessment.get('id') }))
      .then(challenge => this.replaceWith('assessments.challenge', { assessment, challenge }));
  }
});
