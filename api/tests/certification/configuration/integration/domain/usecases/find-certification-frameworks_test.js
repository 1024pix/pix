import { Frameworks } from '../../../../../../src/certification/configuration/domain/models/Frameworks.js';
import { usecases } from '../../../../../../src/certification/configuration/domain/usecases/index.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { databaseBuilder, expect } from '../../../../../test-helper.js';

describe('Certification | Configuration | Integration | Domain | UseCase | find-certification-frameworks', function () {
  it('should return all frameworks with their active version start dates', async function () {
    // given
    const coreStartDate = new Date('2025-01-15');
    const droitStartDate = new Date('2025-06-01');
    const edu1erDegreStartDate = new Date('2025-03-01');

    databaseBuilder.factory.buildCertificationVersion({
      scope: SCOPES.CORE,
      startDate: coreStartDate,
      expirationDate: null,
    });

    databaseBuilder.factory.buildCertificationVersion({
      scope: SCOPES.PIX_PLUS_DROIT,
      startDate: droitStartDate,
      expirationDate: null,
    });

    databaseBuilder.factory.buildCertificationVersion({
      scope: SCOPES.PIX_PLUS_EDU_1ER_DEGRE,
      startDate: new Date(2020, 12, 12),
      expirationDate: new Date(2020, 12, 14),
    });
    databaseBuilder.factory.buildCertificationVersion({
      scope: SCOPES.PIX_PLUS_EDU_1ER_DEGRE,
      startDate: edu1erDegreStartDate,
      expirationDate: null,
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
