import BaseRoute from 'mon-pix/routes/base-route';
import { isEmpty } from '@ember/utils';

export default BaseRoute.extend({

  redirect(course) {
    const store = this.get('store');
    let assessment;

    return store.query('assessment', { filter: { type: course.get('type'), courseId: course.id, state: 'started' } })
      .then(async (assessments) => {
        if (this._thereIsNoStartedAssessment(assessments)) {
          await store.createRecord('assessment', { course, type: course.get('type') }).save()
            .then((createdAssessment) => assessment = createdAssessment);
        } else {
          assessment = assessments.get('firstObject');
        }
        return store.queryRecord('challenge', { assessmentId: assessment.get('id') })
          .then((challenge) => {
            this.replaceWith('assessments.challenge', { assessment, challenge });
          });
      });
  },

  _thereIsNoStartedAssessment(assessments) {
    return isEmpty(assessments);
  }
});
