const databaseBuffer = require('../database-buffer');
const buildOrganizationLearner = require('./build-organization-learner');
const buildUser = require('./build-user');

module.exports = function buildAccountRecoveryDemand({
  id = databaseBuffer.getNextId(),
  userId,
  firstName,
  lastName,
  schoolingRegistrationId,
  oldEmail,
  newEmail = 'philipe@example.net',
  temporaryKey = 'OWIxZGViNGQtM2I3ZC00YmFkLTliZGQtMmIwZDdiM2RjYjZk',
  used = false,
  createdAt = new Date(),
  updatedAt = new Date(),
} = {}) {
  let schoolingRegistrationAttributes;
  let user;

  if (!userId) {
    user = buildUser();
    schoolingRegistrationAttributes = {
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      nationalStudentId: '123456789JJ',
    };
  } else {
    schoolingRegistrationAttributes = { userId, firstName, lastName, nationalStudentId: '123456789JJ' };
  }
  const actualSchoolingRegistrationId =
    schoolingRegistrationId || buildOrganizationLearner(schoolingRegistrationAttributes).id;
  const actualUserId = userId || user.id;

  const values = {
    id,
    userId: actualUserId,
    organizationLearnerId: actualSchoolingRegistrationId,
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
    schoolingRegistrationId: actualSchoolingRegistrationId,
    oldEmail,
    newEmail,
    temporaryKey,
    used,
    createdAt,
    updatedAt,
  };
};
