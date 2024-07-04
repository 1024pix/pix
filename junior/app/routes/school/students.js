import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class StudentsRoute extends Route {
  @service router;

  queryParams = {
    division: '',
  };

  async model(params) {
    const school = await this.modelFor('school');
    const division = params.division;
    if (division) {
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
