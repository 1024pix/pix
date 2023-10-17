import Route from '@ember/routing/route';

export default class DivisionRoute extends Route {
  async model(_, transition) {
    const division = transition.to.queryParams.division;
    const school = await this.modelFor('school');
    const divisionLearners = school.organizationLearners.filter((learner) => learner.division === division);
    return {
      division,
      organizationLearners: divisionLearners,
    };
  }
}
