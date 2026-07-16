import { VERSION_STATUSES } from '../../../../../../src/certification/configuration/domain/models/Version.js';
import { usecases } from '../../../../../../src/certification/configuration/domain/usecases/index.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';

describe('Certification | Configuration | Integration | Domain | UseCase | find-certification-frameworks', function () {
  it('should return all frameworks with their active version start dates', async function () {
    // given
    const coreStartDate = new Date('2025-01-15');
    const droitStartDate = new Date('2025-06-01');
    const edu1erDegreStartDate = new Date('2025-03-01');

    databaseBuilder.factory.buildCertificationVersion({
      id: 123,
      scope: SCOPES.CORE,
      startDate: coreStartDate,
      status: VERSION_STATUSES.ACTIVE,
    });
    databaseBuilder.factory.buildCertificationVersionTube({
      tubeId: 'tubeA',
      versionId: 123,
    });

    databaseBuilder.factory.buildCertificationVersion({
      id: 456,
      scope: SCOPES.PIX_PLUS_DROIT,
      startDate: droitStartDate,
      status: VERSION_STATUSES.ACTIVE,
    });
    databaseBuilder.factory.buildCertificationVersionTube({
      tubeId: 'tubeA',
      versionId: 456,
    });

    databaseBuilder.factory.buildCertificationVersion({
      id: 789,
      scope: SCOPES.PIX_PLUS_EDU_1ER_DEGRE,
      startDate: new Date(2020, 12, 12),
      expirationDate: new Date(2020, 12, 14),
      status: VERSION_STATUSES.ARCHIVED,
    });
    databaseBuilder.factory.buildCertificationVersionTube({
      tubeId: 'tubeA',
      versionId: 789,
    });

    databaseBuilder.factory.buildCertificationVersion({
      id: 159,
      scope: SCOPES.PIX_PLUS_EDU_1ER_DEGRE,
      startDate: edu1erDegreStartDate,
      status: VERSION_STATUSES.ACTIVE,
    });
    databaseBuilder.factory.buildCertificationVersionTube({
      tubeId: 'tubeA',
      versionId: 159,
    });

    await databaseBuilder.commit();

    // when
    const frameworks = await usecases.findCertificationFrameworks();

    // then
    expect(frameworks).to.have.deep.members([
      {
        id: Frameworks.CORE,
        name: Frameworks.CORE,
        activeVersionStartDate: coreStartDate,
      },
      {
        id: Frameworks.DROIT,
        name: Frameworks.DROIT,
        activeVersionStartDate: droitStartDate,
      },
      {
        id: Frameworks.EDU_1ER_DEGRE,
        name: Frameworks.EDU_1ER_DEGRE,
        activeVersionStartDate: edu1erDegreStartDate,
      },
      {
        id: Frameworks.EDU_2ND_DEGRE,
        name: Frameworks.EDU_2ND_DEGRE,
        activeVersionStartDate: null,
      },
      {
        id: Frameworks.EDU_CPE,
        name: Frameworks.EDU_CPE,
        activeVersionStartDate: null,
      },
      {
        id: Frameworks.PRO_SANTE,
        name: Frameworks.PRO_SANTE,
        activeVersionStartDate: null,
      },
      {
        id: Frameworks.CLEA,
        name: Frameworks.CLEA,
        activeVersionStartDate: null,
      },
    ]);
  });
});
