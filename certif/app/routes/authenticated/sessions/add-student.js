import Route from '@ember/routing/route';

export default class AuthenticatedSessionsDetailsAddStudentRoute extends Route {
  async model(params) {
    const { id: certificationCenterId } = this.modelFor('authenticated');
    const students = await this.store.findAll('student',
      { adapterOptions : { certificationCenterId } },
    );
    return { sessionId: params.session_id, students };
  }
}
