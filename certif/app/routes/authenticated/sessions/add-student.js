import Route from '@ember/routing/route';

export default class AuthenticatedSessionsDetailsAddStudentRoute extends Route {
  async model(params) {
    const session = await this.store.findRecord('session', params.session_id);
    const { id: certificationCenterId } = this.modelFor('authenticated');
    const students = await this.store.findAll('student',
      { adapterOptions : { certificationCenterId } },
    );
    const certificationCandidates = await this.store.query('certification-candidate', {
      sessionId: params.session_id,
    });

    students.forEach((student) => {
      const isEnrolled = certificationCandidates.toArray()
        .some((candidate) => candidate.schoolingRegistrationId === student.id);
      student.isEnrolled = isEnrolled;
    });

    return { session, students };
  }

  setupController(controller, model) {
    super.setupController(controller, model);

    this.controllerFor('authenticated.sessions.add-student').set(
      'returnToSessionCandidates',
      (sessionId) => this.transitionTo('authenticated.sessions.details.certification-candidates', sessionId),
    );
  }

  resetController(controller, isExiting) {
    if (isExiting) {
      const allStudentsInStore = this.store.peekAll('student');
      allStudentsInStore.forEach((student) => {
        student.isSelected = false;
      });
    }
  }
}
