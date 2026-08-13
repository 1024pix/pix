export const data = {};

export function fixture({ databaseBuilder }) {
  const createdById = databaseBuilder.factory.buildUser().id;
  const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
  databaseBuilder.factory.buildCertificationCenterMembership({
    userId: createdById,
    certificationCenterId,
  });
  const sessionId = databaseBuilder.factory.buildSession({
    address: '3 rue des pignons',
    room: 'B540',
    examiner: 'Giles',
    date: '2021-01-02',
    time: '13:45:00',
    description: 'Cette session se déroulera au 3 rue des pignons',
    accessCode: '456DEF',
    invigilatorPassword: '123ABC',
    finalizedAt: null,
    publishedAt: null,
    certificationCenterId,
    createdBy: createdById,
  }).id;
  data.sessionId = sessionId;
  data.createdById = createdById;
  data.certificationCenterId = certificationCenterId;
}
