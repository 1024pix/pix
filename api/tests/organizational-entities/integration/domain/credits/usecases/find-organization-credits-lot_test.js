import { expect } from 'chai';

import { OrganizationNotFound } from '../../../../../../src/organizational-entities/domain/errors.js';
import { usecases } from '../../../../../../src/organizational-entities/domain/usecases/index.js';
import { databaseBuilder } from '../../../../../tooling/databases.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

describe('Integration | Domain | Use Cases | Credits | find-organization-credits-lot', function () {
  it('should return credits lot for given organization ID', async function () {
    // given
    const { structure, organization } = databaseBuilder.factory.buildOrganizationWithStructure();

    const creator = databaseBuilder.factory.buildUser();

    databaseBuilder.factory.buildCreditsLot({
      structureId: structure.id,
      count: 100,
      reference: 'FIRST',
      activationDate: '2026-01-01',
      expirationDate: '2027-12-31',
      createdAt: '2026-01-01',
      createdBy: creator.id,
    });

    await databaseBuilder.commit();

    // when
    const foundCreditsLot = await usecases.findOrganizationCreditsLot({ organizationId: organization.id });

    // then
    expect(foundCreditsLot[0].reference).to.equal('FIRST');
  });

  it('should throw an OrganizationNotFound error when organization id does not exist', async function () {
    // given
    const notExistingOrganizationId = 99999;

    // when
    const error = await catchErr(usecases.findOrganizationCreditsLot)({ organizationId: notExistingOrganizationId });

    // then
    expect(error).to.be.instanceOf(OrganizationNotFound);
    expect(error.meta).to.deep.equal({ organizationId: notExistingOrganizationId });
  });
});
