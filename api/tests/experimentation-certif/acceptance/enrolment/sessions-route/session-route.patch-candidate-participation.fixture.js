import { makeCertifiable } from '../../common/helpers.js';

export const data1 = {};
export const data2 = {};

export function fixture({ databaseBuilder }) {
  buildFixture1({ databaseBuilder });
  buildFixture2({ databaseBuilder });
}

function buildFixture1({ databaseBuilder }) {
  const createdById = databaseBuilder.factory.buildUser().id;
  const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
  databaseBuilder.factory.buildCertificationCenterMembership({
    userId: createdById,
    certificationCenterId,
  });
  const sessionId = databaseBuilder.factory.buildSession({
    finalizedAt: null,
    publishedAt: null,
    certificationCenterId,
    createdBy: createdById,
  }).id;
  const candidateId = databaseBuilder.factory.buildCertificationCandidate({
    sessionId,
    firstName: 'Buffy',
    lastName: 'Summers',
    birthdate: '1990-01-04',
    userId: null,
  }).id;
  const userId = databaseBuilder.factory.buildUser().id;
  makeCertifiable({ databaseBuilder, userId });
  data1.userId = userId;
  data1.sessionId = sessionId;
  data1.candidateId = candidateId;
}

function buildFixture2({ databaseBuilder }) {
  const createdById = databaseBuilder.factory.buildUser().id;
  const organizationId = databaseBuilder.factory.buildOrganization({
    externalId: `EXTERNALID${createdById}`,
    type: 'SCO',
    isManagingStudents: true,
  }).id;
  const userId = databaseBuilder.factory.buildUser().id;
  const organizationLearnerId = databaseBuilder.factory.buildOrganizationLearner({
    organizationId,
    userId,
    firstName: 'Buffy',
    lastName: 'Summers',
    birthdate: '1990-01-04',
  }).id;
  const certificationCenterId = databaseBuilder.factory.buildCertificationCenter({
    externalId: `EXTERNALID${createdById}`,
    type: 'SCO',
  }).id;
  databaseBuilder.factory.buildCertificationCenterMembership({
    userId: createdById,
    certificationCenterId,
  });
  const sessionId = databaseBuilder.factory.buildSession({
    finalizedAt: null,
    publishedAt: null,
    certificationCenterId,
    createdBy: createdById,
  }).id;
  const candidateId = databaseBuilder.factory.buildCertificationCandidate({
    sessionId,
    firstName: 'Buffy',
    lastName: 'Summers',
    birthdate: '1990-01-04',
    userId: null,
    organizationLearnerId,
  }).id;

  makeCertifiable({ databaseBuilder, userId });
  data2.userId = userId;
  data2.sessionId = sessionId;
  data2.candidateId = candidateId;
}
