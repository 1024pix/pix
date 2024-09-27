import { PixCertification } from '../../../../../../src/certification/enrolment/domain/models/PixCertification.js';
import { AssessmentResult } from '../../../../../../src/shared/domain/models/index.js';

const buildPixCertification = function ({
  pixScore = 123,
  status = AssessmentResult.status.VALIDATED,
  isCancelled = false,
  isRejectedForFraud = false,
} = {}) {
  return new PixCertification({
    pixScore,
    status,
    isCancelled,
    isRejectedForFraud,
  });
};

export { buildPixCertification };
