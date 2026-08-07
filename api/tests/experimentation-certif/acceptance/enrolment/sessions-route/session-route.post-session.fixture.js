export const data = {};

export function fixture({ databaseBuilder }) {
  const createdById = databaseBuilder.factory.buildUser().id;
  const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
  databaseBuilder.factory.buildCertificationCenterMembership({
    userId: createdById,
    certificationCenterId,
  });
  data.createdById = createdById;
  data.certificationCenterId = certificationCenterId;
}
