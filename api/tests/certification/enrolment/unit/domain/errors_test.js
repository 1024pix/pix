import * as errors from '../../../../../src/certification/enrolment/domain/errors.js';
import { expect } from '../../../../test-helper.js';

describe('Certification | Enrolment | Unit | Domain | Errors', function () {
  it('should export a UnknownCountryForStudentEnrolmentError error', function () {
    expect(errors.UnknownCountryForStudentEnrolmentError).to.exist;
  });
});
