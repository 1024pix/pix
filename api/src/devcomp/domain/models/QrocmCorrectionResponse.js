import { assertNotNullOrUndefined } from '../../../shared/domain/models/asserts.js';

class QrocmCorrectionResponse {
  constructor({ status, feedback, solution }) {
    assertNotNullOrUndefined(status, 'The result is required in a QROCM correction');
    assertNotNullOrUndefined(feedback, 'The feedback is required in a QROCM correction');
    assertNotNullOrUndefined(solution, 'The solution is required in a QROCM correction');

    this.status = status;
    this.feedback = feedback;
    this.solution = solution;
  }
}

export { QrocmCorrectionResponse };
