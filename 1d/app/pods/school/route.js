import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class SchoolRoute extends Route {
  @service store;

  async model(params) {
    const school = await this.store.findRecord('school', params.code);
    const divisions = [...new Set(school.organizationLearners.map((learner) => learner.division))];
    return {
      code: school.code,
      name: school.name,
      organizationLearners: school.organizationLearners,
      divisions: divisions.sort(),
    };
  }
}
