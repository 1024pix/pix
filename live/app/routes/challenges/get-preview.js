import _ from 'pix-live/utils/lodash-custom';
import BaseRoute from 'pix-live/routes/base-route';

export default BaseRoute.extend({

  model(params) {
    const store = this.get('store');
    return store.findRecord('challenge', params.challenge_id);
  },

  afterModel(challenge) {
    const store = this.get('store');
    const that = this;
    // creates a fake course
    const course = store.createRecord('course', { id: 'null' + _.guid(), challenges: [challenge] });
    const assessment = store.createRecord('assessment', { course });
    const solutionAdapter = store.adapterFor('solution');

    solutionAdapter.refreshRecord('solution', { challengeId : challenge.get('id') });
    return assessment.save().then(() => {
      return that.transitionTo('assessments.get-challenge', { assessment, challenge });
    });
  }

});
