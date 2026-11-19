import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { CombinedCourseStatuses } from 'mon-pix/models/combined-course';

export default class CombinedCourseLandingPageRoute extends Route {
  @service session;
  @service router;
  @service store;

  beforeModel() {
    const combinedCourse = this.modelFor('combined-courses.combined-course');

    if (this.session.isAuthenticated && combinedCourse.status !== CombinedCourseStatuses.NOT_STARTED) {
      return this.router.replaceWith('organizations.access', combinedCourse.code);
    }
  }

  async model() {
    const { code } = this.modelFor('combined-courses.combined-course');
    return this.store.queryRecord('combined-course', { filter: { code } });
  }
}
