import classic from 'ember-classic-decorator';
import Route from '@ember/routing/route';

@classic
export default class ResumeRoute extends Route {
  model(params) {
    const store = this.store;
    const certificationCourse = store.peekRecord('certification-course', params.certification_course_id);
    this.replaceWith('assessments.resume', certificationCourse.get('assessment'));
  }
}
