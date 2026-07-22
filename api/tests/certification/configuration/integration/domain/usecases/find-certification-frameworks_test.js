import { usecases } from '../../../../../../src/certification/configuration/domain/usecases/index.js';
import { Frameworks } from '../../../../../../src/certification/shared/domain/models/Frameworks.js';
import { SCOPES } from '../../../../../../src/certification/shared/domain/models/Scopes.js';
import { expect } from '../../../../../test-helper.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Certification | Configuration | Integration | Domain | UseCase | find-certification-frameworks', function () {
  it('should return all frameworks with their active version start dates', async function () {
    // given
    const coreStartDate = new Date('2025-01-15');
    const droitStartDate = new Date('2025-06-01');
    const edu1erDegreStartDate = new Date('2025-03-01');

    domainBuilder.certification.configuration
      .versionBuilder()
      .asActive({ startDate: coreStartDate })
      .withParameters({ scope: SCOPES.CORE, tubeIds: ['tubeA'], id: 123 })
      .insertToDB({ databaseBuilder });

    domainBuilder.certification.configuration
      .versionBuilder()
      .asActive({ startDate: droitStartDate })
      .withParameters({ scope: SCOPES.PIX_PLUS_DROIT, tubeIds: ['tubeA'], id: 456 })
      .insertToDB({ databaseBuilder });

    domainBuilder.certification.configuration
      .versionBuilder()
      .asArchived({ startDate: new Date(2020, 12, 12), expirationDate: new Date(2020, 12, 14) })
      .withParameters({ scope: SCOPES.PIX_PLUS_EDU_1ER_DEGRE, tubeIds: ['tubeA'], id: 789 })
      .insertToDB({ databaseBuilder });

    domainBuilder.certification.configuration
      .versionBuilder()
      .asActive({ startDate: edu1erDegreStartDate })
      .withParameters({ scope: SCOPES.PIX_PLUS_EDU_1ER_DEGRE, tubeIds: ['tubeA'], id: 159 })
      .insertToDB({ databaseBuilder });

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
