import { assertNotNullOrUndefined } from '../../../shared/domain/models/asserts.js';

class QcmCorrectionResponse {
  constructor({ status, feedback, solution }) {
    assertNotNullOrUndefined(status, 'The result is required for a QCM answer');
    assertNotNullOrUndefined(feedback, 'The feedback is required for a QCM answer');
    assertNotNullOrUndefined(solution, 'The solutions are required for a QCM answer');

    this.status = status;
    this.feedback = feedback;
    this.solution = solution;
  }
}

export { QcmCorrectionResponse };
