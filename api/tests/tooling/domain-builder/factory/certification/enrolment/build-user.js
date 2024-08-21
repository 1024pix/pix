import { User } from '../../../../../../src/certification/enrolment/domain/models/User.js';

export function buildUserEnrolment({ id = 123, lang = 'UneLangueParDefaut', organizationLearnerIds = [] } = {}) {
  return new User({
    id,
    lang,
    organizationLearnerIds,
  });
}
