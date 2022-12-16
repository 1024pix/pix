const databaseBuffer = require('../database-buffer');
const buildOrganizationLearner = require('./build-organization-learner');
const buildUser = require('./build-user');

module.exports = function buildAccountRecoveryDemand({
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
