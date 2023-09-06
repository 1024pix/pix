import { createCertificationCenter } from '../common/tooling/certification-center-tooling.js';

const CERTIFICATION_CENTER_OFFSET_ID = 8000;

export async function buildCertificationCenters(databaseBuilder) {
  const firstUser = databaseBuilder.factory.buildUser({ firstName: 'James', lastName: 'Palédroits' });
  const secondUser = databaseBuilder.factory.buildUser({ firstName: 'Marc-Alex', lastName: 'Terrieur' });

  await createCertificationCenter({
    name: 'Accèssorium',
    certificationCenterId: CERTIFICATION_CENTER_OFFSET_ID,
    databaseBuilder,
    members: [{ id: firstUser.id, role: 'ADMIN' }, { id: secondUser.id }],
    externalId: 'TEAM_ACCES_123',
  });
}
