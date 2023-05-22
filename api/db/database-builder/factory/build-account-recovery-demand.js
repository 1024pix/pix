import { databaseBuffer } from '../database-buffer.js';
import { buildOrganizationLearner } from './build-organization-learner.js';
import { buildUser } from './build-user.js';

const buildAccountRecoveryDemand = function ({
  id = databaseBuffer.getNextId(),
  userId,
  firstName,
  lastName,
  organizationLearnerId,
  oldEmail,
  newEmail = 'philipe@example.net',
  temporaryKey = 'OWIxZGViNGQtM2I3ZC00YmFkLTliZGQtMmIwZDdiM2RjYjZk',
  used = false,
  createdAt = new Date(),
  updatedAt = new Date(),
} = {}) {
  let organizationLearnerAttributes;
  let user;

  if (!userId) {
    user = buildUser();
    organizationLearnerAttributes = {
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      nationalStudentId: '123456789JJ',
    };
  } else {
    organizationLearnerAttributes = { userId, firstName, lastName, nationalStudentId: '123456789JJ' };
  }
  const actualOrganizationLearnerId =
    organizationLearnerId || buildOrganizationLearner(organizationLearnerAttributes).id;
  const actualUserId = userId || user.id;

  const values = {
    id,
    userId: actualUserId,
    organizationLearnerId: actualOrganizationLearnerId,
    oldEmail,
    newEmail,
    temporaryKey,
    used,
    createdAt,
    updatedAt,
  };

  databaseBuffer.pushInsertable({
    tableName: 'account-recovery-demands',
    values,
  });

  return {
    id,
    userId: actualUserId,
    organizationLearnerId: actualOrganizationLearnerId,
    oldEmail,
    newEmail,
    temporaryKey,
    used,
    createdAt,
    updatedAt,
  };
};

export { buildAccountRecoveryDemand };
