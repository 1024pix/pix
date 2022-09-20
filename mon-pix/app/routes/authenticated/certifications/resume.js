import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';

export default class ResumeRoute extends Route {
  @service store;
  @service router;

  model(params) {
    const store = this.store;
    const certificationCourse = store.peekRecord('certification-course', params.certification_course_id);
    this.router.replaceWith('assessments.resume', certificationCourse.assessment);
  }
}
