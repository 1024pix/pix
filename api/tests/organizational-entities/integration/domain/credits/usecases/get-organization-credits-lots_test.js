import { expect } from 'chai';

import { usecases } from '../../../../../../src/organizational-entities/domain/usecases/index.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { domainBuilder } from '../../../../../tooling/domain-builder/domain-builder.js';

describe('Integration | Domain | Use Cases | Credits | get-organization-credits-lots', function () {
  it('returns the organization credits lots with their consumptions, active first, then pending, expired last', async function () {
    // given
    const { structure, organization } = databaseBuilder.factory.buildOrganizationWithStructure();

    const expiredLot = {
      structureId: structure.id,
      count: 1,
      reference: 'EXPIRED',
      activationDate: new Date('2020-01-01'),
      expirationDate: new Date('2021-01-01'),
    };
    const pendingLot = {
      structureId: structure.id,
      count: 2,
      reference: 'PENDING',
      activationDate: new Date('2998-01-01'),
      expirationDate: new Date('2999-12-31'),
    };
    const secondActiveLot = {
      structureId: structure.id,
      count: 4,
      reference: 'SECOND-ACTIVE',
      activationDate: new Date('2022-01-01'),
      expirationDate: new Date('2999-12-31'),
    };
    const firstActiveLot = {
      structureId: structure.id,
      count: 3,
      reference: 'FIRST-ACTIVE',
      activationDate: new Date('2021-01-01'),
      expirationDate: new Date('2999-12-31'),
    };
    const expiredLotId = databaseBuilder.factory.buildCreditsLot(expiredLot).id;
    const pendingLotId = databaseBuilder.factory.buildCreditsLot(pendingLot).id;
    const secondActiveLotId = databaseBuilder.factory.buildCreditsLot(secondActiveLot).id;
    const firstActiveLotId = databaseBuilder.factory.buildCreditsLot(firstActiveLot).id;

    const learner = databaseBuilder.factory.buildOrganizationLearner({
      organizationId: organization.id,
      firstName: 'Lucie',
      lastName: 'Fer',
    });
    databaseBuilder.factory.buildCreditsConsumption({
      creditsLotId: firstActiveLotId,
      organizationLearnerId: learner.id,
      consumedAt: new Date('2026-02-01'),
    });

    await databaseBuilder.commit();

    // when
    const creditsLots = await usecases.getOrganizationCreditsLots({ organizationId: organization.id });

    // then
    expect(creditsLots).to.deep.equal([
      domainBuilder.acquisition.buildOrganizationCreditsLot({
        ...firstActiveLot,
        id: firstActiveLotId,
        consumptions: [
          {
            organizationLearnerId: learner.id,
            firstName: 'Lucie',
            lastName: 'Fer',
            consumedAt: new Date('2026-02-01'),
          },
        ],
      }),
      domainBuilder.acquisition.buildOrganizationCreditsLot({ ...secondActiveLot, id: secondActiveLotId }),
      domainBuilder.acquisition.buildOrganizationCreditsLot({ ...pendingLot, id: pendingLotId }),
      domainBuilder.acquisition.buildOrganizationCreditsLot({ ...expiredLot, id: expiredLotId }),
    ]);
  });
});
