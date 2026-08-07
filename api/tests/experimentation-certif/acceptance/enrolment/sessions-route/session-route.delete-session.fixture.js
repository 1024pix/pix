export const data = {};

export function fixture({ databaseBuilder }) {
  const createdById = databaseBuilder.factory.buildUser().id;
  const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
  databaseBuilder.factory.buildCertificationCenterMembership({
    userId: createdById,
    certificationCenterId,
  });
  const sessionId = databaseBuilder.factory.buildSession({
    certificationCenterId,
    createdBy: createdById,
  }).id;
  databaseBuilder.factory.buildCertificationCandidate({
    sessionId,
    userId: null,
  });
  data.sessionId = sessionId;
  data.createdById = createdById;
}
