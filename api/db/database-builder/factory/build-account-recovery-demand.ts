import { databaseBuffer } from '../database-buffer.ts';
import { buildOrganizationLearner } from './build-organization-learner.js';
import { buildUser } from './build-user.ts';

type AccountRecoveryDemandAttributes = {
  id?: number;
  userId?: number | null;
  firstName?: string;
  lastName?: string;
  organizationLearnerId?: number | null;
  oldEmail?: string | null;
  newEmail?: string | null;
  temporaryKey?: string;
  used?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

const NATIONAL_STUDENT_ID = '123456789JJ';

const buildAccountRecoveryDemand = ({
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
}: AccountRecoveryDemandAttributes = {}) => {
  // Without a user, one is created and the organization learner takes its name.
  const user = userId ? { id: userId, firstName, lastName } : buildUser();

  const values = {
    id,
    userId: user.id,
    organizationLearnerId:
      organizationLearnerId ||
      buildOrganizationLearner({
        userId: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        nationalStudentId: NATIONAL_STUDENT_ID,
      }).id,
    oldEmail,
    newEmail,
    temporaryKey,
    used,
    createdAt,
    updatedAt,
  };

  return databaseBuffer.pushInsertable({ tableName: 'account-recovery-demands', values });
};

export { buildAccountRecoveryDemand };
