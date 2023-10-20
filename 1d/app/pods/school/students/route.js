import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class StudentsRoute extends Route {
  @service router;

  async model(_, transition) {
    const school = await this.modelFor('school');
    if (transition.to.queryParams.division) {
      const division = transition.to.queryParams.division;
      const divisionLearners = school.organizationLearners.filter((learner) => learner.division === division);
      return {
        division,
        organizationLearners: divisionLearners,
        schoolUrl: `/schools/${school.code}`,
      };
    } else {
      return this.router.replaceWith('school', school);
    }
  }
}
