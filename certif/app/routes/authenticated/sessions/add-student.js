import Route from '@ember/routing/route';

export default class AuthenticatedSessionsDetailsAddStudentRoute extends Route {
  async model(params) {
    const session = await this.store.findRecord('session', params.session_id);
    const { id: certificationCenterId } = this.modelFor('authenticated');
    const students = await this.store.findAll('student',
      { adapterOptions : { certificationCenterId } },
    );
    return { session, students };
  }
}
