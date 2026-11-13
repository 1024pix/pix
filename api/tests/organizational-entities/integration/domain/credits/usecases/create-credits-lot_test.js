import { expect } from 'chai';

import { OrganizationNotFound } from '../../../../../../src/organizational-entities/domain/errors.js';
import { usecases } from '../../../../../../src/organizational-entities/domain/usecases/index.js';
import { databaseBuilder, knex } from '../../../../../tooling/databases.js';
import { catchErr } from '../../../../../tooling/test-utils/error.js';

const millisecondBefore = (isoDate) => new Date(new Date(isoDate).getTime() - 1);

describe('Integration | Domain | Use Cases | Credits | create-credits-lot', function () {
  let createdBy, creditsLot;

  beforeEach(async function () {
    createdBy = databaseBuilder.factory.buildUser().id;
    creditsLot = {
      count: 2,
      activationDate: '2026-01-01',
      expirationDate: '2026-12-31',
      reference: 'ABC',
      createdBy,
    };
    await databaseBuilder.commit();
  });

  it('creates the lot on the structure of the organization', async function () {
    // given
    const structureId = databaseBuilder.factory.buildStructure().id;
    const organization = databaseBuilder.factory.buildOrganization({ structureId });

    await databaseBuilder.commit();

    // when
    const creditsLotId = await usecases.createCreditsLot({ organizationId: organization.id, creditsLot });

    // then
    const createdCreditsLot = await knex('credits_lots').where({ id: creditsLotId }).first();

    expect(createdCreditsLot.structure_id).to.equal(structureId);
    expect(createdCreditsLot.count).to.equal(creditsLot.count);
    expect(createdCreditsLot.activation_date).to.deep.equal(new Date('2025-12-31T23:00:00Z'));
    expect(createdCreditsLot.expiration_date).to.deep.equal(millisecondBefore('2026-12-31T23:00:00Z'));
    expect(createdCreditsLot.created_by).to.equal(createdBy);
  });

  it('throws when the organization does not exist', async function () {
    // given
    const organizationId = 0;

    // when
    const error = await catchErr(usecases.createCreditsLot)({ creditsLot, organizationId });

    // then
    expect(error).to.be.an.instanceOf(OrganizationNotFound);
  });
});
