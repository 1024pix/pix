import Route from '@ember/routing/route';
import { action } from '@ember/object';

export default class AuthenticatedSessionsDetailsAddStudentRoute extends Route {
  queryParams = {
    pageNumber: { refreshModel: true },
    pageSize: { refreshModel: true },
  };

  async model(params) {
    const session = await this.store.findRecord('session', params.session_id);
    const { id: certificationCenterId } = this.modelFor('authenticated');

    const certificationCandidates = await this.store.query('certification-candidate', { sessionId:params.session_id });
    const DEFAULT_PAGE_SIZE = 50;
    const FIRST_PAGE_NUMBER = 1;
    const students = await this.store.query('student',
      {
        page: {
          number: params.pageNumber || FIRST_PAGE_NUMBER,
          size: params.pageSize || DEFAULT_PAGE_SIZE,
        },
        filter : {
          certificationCenterId,
          sessionId: session.id,
        } ,
      },
    );

    return { session, students, numberOfEnrolledStudents: certificationCandidates.length };
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
      controller.set('pageSize', undefined);
      controller.set('pageNumber', undefined);
      const allStudentsInStore = this.store.peekAll('student');
      allStudentsInStore.forEach((student) => {
        student.isSelected = false;
      });
    }
  }

  @action
  refreshModel() {
    this.refresh();
  }
}
