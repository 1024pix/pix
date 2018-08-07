import BaseRoute from 'mon-pix/routes/base-route';
import AuthenticatedRouteMixin from 'ember-simple-auth/mixins/authenticated-route-mixin';
import { isEmpty } from '@ember/utils';

export default BaseRoute.extend(AuthenticatedRouteMixin, {

  model(params) {
    const codeCampaign = params.campaign_code;
    const store = this.get('store');
    return store.query('assessment', { filter: { type: 'SMART_PLACEMENT', codeCampaign } })
      .then((smartPlacementAssessments) => {
        if (!isEmpty(smartPlacementAssessments)) {
          return smartPlacementAssessments.get('firstObject');
        }
        return store.createRecord('assessment', { type: 'SMART_PLACEMENT', codeCampaign }).save();
      });
  },

  afterModel(assessment) {
    const store = this.get('store');
    return assessment.reload()
      .then(() => store.queryRecord('challenge', { assessmentId: assessment.get('id') }))
      .then((challenge) => this.transitionTo('assessments.challenge', { assessment, challenge }))
      .catch(() => {
        // FIXME: do not manage error when there is no more challenge anymore
        this.transitionTo('assessments.rating', assessment.get('id'));
      });
  }
});
