import _ from 'mon-pix/utils/lodash-custom';
import BaseRoute from 'mon-pix/routes/base-route';

export default BaseRoute.extend({

  model(params) {
    const store = this.get('store');
    return store.findRecord('challenge', params.challenge_id);
  },

  afterModel(challenge) {
    const store = this.get('store');
    const that = this;
    // creates a fake course
    const course = store.createRecord('course', { id: 'null' + _.guid(), type: 'PREVIEW', challenges: [challenge] });
    const assessment = store.createRecord('assessment', { course, type: course.get('type') });

    const correctionAdapter = store.adapterFor('correction');

    correctionAdapter.refreshRecord('correction', { challengeId: challenge.get('id') });
    return assessment.save().then(() => {
      return that.transitionTo('assessments.challenge', { assessment, challenge });
    });
  }
});
