import { PixPlusCertificationCourse } from '../../../../../../src/certification/session-management/domain/models/PixPlusCertificationCourse.js';

export const buildPixPlusCertificationCourse = function ({ id, createdAt } = {}) {
  return new PixPlusCertificationCourse({ id, createdAt });
};
