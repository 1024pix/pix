import ApplicationAdapter from './application';

export default class AutonomousCourseTargetProfileAdapter extends ApplicationAdapter {
  namespace = 'api/admin';

  urlForFindAll() {
    return `${this.host}/${this.namespace}/autonomous-courses/target-profiles`;
  }
}
