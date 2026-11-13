import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { CombinedCourseStatuses } from 'mon-pix/models/combined-course';

export default class CombinedCourseEntryPointRoute extends Route {
  @service session;
  @service router;

  async beforeModel() {
    if (!this.session.isAuthenticated) {
      return this.router.replaceWith('combined-courses.combined-course.landing-page');
    }

    const combinedCourse = this.modelFor('combined-courses.combined-course');

    if (combinedCourse.status === CombinedCourseStatuses.NOT_STARTED) {
      return this.router.replaceWith('combined-courses.combined-course.landing-page');
    }

    return this.router.replaceWith('organizations.access', combinedCourse.code);
  }
}
