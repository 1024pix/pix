import { expect } from '../../../../test-helper.js';
import * as errors from '../../../../../src/certification/shared/domain/errors.js';

describe('Certification | shared | Unit | Domain | Errors', function () {
  it('should export a CertificationCourseUpdateError', function () {
    expect(errors.CertificationCourseUpdateError).to.exist;
  });

  it('should export a InvalidCertificationReportForFinalization', function () {
    expect(errors.InvalidCertificationReportForFinalization).to.exist;
  });
});
