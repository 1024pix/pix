import BaseRoute from 'mon-pix/routes/base-route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { isEmpty } from '@ember/utils';

export default BaseRoute.extend(AuthenticatedRouteMixin, {

  beforeModel(transition) {
    this.get('session').set('data.intentUrl', transition.intent.url);
    this._super(...arguments);
  },

  async model() {
    const store = this.get('store');
    const smartPlacementAssessments = await store.query('assessment', { filter: { type: 'SMART_PLACEMENT' } });
    if (!isEmpty(smartPlacementAssessments)) {
      return smartPlacementAssessments.get('firstObject');
    }
    return store.createRecord('assessment', { type: 'SMART_PLACEMENT' }).save();
  },

  async afterModel(assessment) {
    const store = this.get('store');
    console.log('HERE 3');
    console.log(assessment);
    try {
      await assessment.reload();
      const challenge = await store.queryRecord('challenge', { assessmentId: assessment.get('id') });
      return this.transitionTo('assessments.challenge', { assessment, challenge });
    } catch (error) {
      // FIXME: do not manage error when there is no more challenge anymore
      this.transitionTo('assessments.rating', assessment.get('id'));
    }
  }
});
