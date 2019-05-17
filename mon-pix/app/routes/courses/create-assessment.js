import Route from '@ember/routing/route';
import { isEmpty } from '@ember/utils';

export default Route.extend({

  afterModel(course) {
    const store = this.store;

    return store.query('assessment', { filter: { type: course.get('type'), courseId: course.id, resumable: true } })
      .then((assessments) => {
        if (this._thereIsNoResumableAssessment(assessments)) {
          return store.createRecord('assessment', { course, type: course.get('type') }).save();
        } else {
          return assessments.get('firstObject');
        }
      }).then((assessment) => {
        return this.replaceWith('assessment.resume', assessment.get('id'));
      });
  },

  _thereIsNoResumableAssessment(assessments) {
    return isEmpty(assessments);
  }
});
