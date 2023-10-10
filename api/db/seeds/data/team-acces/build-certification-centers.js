import { DEFAULT_PASSWORD } from '../../../constants.js';
import { createCertificationCenter } from '../common/tooling/certification-center-tooling.js';

const CERTIFICATION_CENTER_OFFSET_ID = 8000;

export async function buildCertificationCenters(databaseBuilder) {
  const [
    userWithAdminRole1,
    userWithAdminRole2,
    userWithMemberRole1,
    userWithMemberRole2,
    userWithMemberRole3,
    userWithInvitation,
    secondUserWithInvitation,
  ] = [
    {
      firstName: 'James',
      lastName: 'Palédroits',
      email: 'james-paledroits@example.net',
      username: 'james.paledroits',
    },
    {
      firstName: 'Agathe',
      lastName: 'Zeublouse',
      email: 'agathe-zeublouse@example.net',
      username: 'agathe.zeublouse',
    },
    {
      firstName: 'Marc-Alex',
      lastName: 'Terrieur',
      email: 'marc-alex-terrieur@example.net',
      username: 'marc-alex-terrieur',
    },
    {
      firstName: 'Harry',
      lastName: 'Cover',
      email: 'harry-cover@example.net',
      username: 'harry.cover',
    },
    {
      firstName: 'Renée',
      lastName: 'Sens',
      email: 'renee-sens@example.net',
      username: 'renee.sens',
    },
    {
      firstName: 'Camille',
      lastName: 'Onette',
      email: 'camille-onette@example.net',
      username: 'camille.onette',
    },

    {
      firstName: 'Lee',
      lastName: 'Tige',
      email: 'lee-tige@example.net',
      username: 'lee.tige',
    },
  ].map((user) => _buildUsersWithDefaultPassword({ databaseBuilder, ...user }));

  const { certificationCenterId } = await createCertificationCenter({
    name: 'Accèssorium',
    certificationCenterId: CERTIFICATION_CENTER_OFFSET_ID,
    databaseBuilder,
    members: [
      { id: userWithAdminRole1.id, role: 'ADMIN' },
      { id: userWithAdminRole2.id, role: 'ADMIN' },
      { id: userWithMemberRole1.id },
      { id: userWithMemberRole2.id },
      { id: userWithMemberRole3.id },
    ],
    externalId: 'TEAM_ACCES_123',
  });

  await createCertificationCenter({
    name: 'Accèssovolt',
    certificationCenterId: CERTIFICATION_CENTER_OFFSET_ID + 1,
    databaseBuilder,
    members: [{ id: userWithAdminRole1.id }],
    externalId: 'TEAM_ACCES_456',
  });

  _buildCertificationCenterInvitations({
    databaseBuilder,
    users: [userWithInvitation, secondUserWithInvitation],
    certificationCenterId,
  });
}

function _buildUsersWithDefaultPassword({
  databaseBuilder,
  firstName,
  lastName,
  email,
  username,
  rawPassword = DEFAULT_PASSWORD,
}) {
  return databaseBuilder.factory.buildUser.withRawPassword({
    firstName,
    lastName,
    email,
    username,
    rawPassword,
    cgu: true,
    lastPixCertifTermsOfServiceValidatedAt: new Date(),
    pixCertifTermsOfServiceAccepted: true,
  });
}

function _buildCertificationCenterInvitations({ databaseBuilder, users, certificationCenterId }) {
  users.forEach(({ id: userId, email }) => {
    databaseBuilder.factory.buildCertificationCenterInvitation({
      userId,
      certificationCenterId,
      email,
    });
  });
}
