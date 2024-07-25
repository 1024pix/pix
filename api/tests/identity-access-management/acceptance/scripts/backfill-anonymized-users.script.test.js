import { backfillAnonymizedUsers } from '../../../../src/identity-access-management/scripts/backfill-anonymized-users.js';
import { databaseBuilder, expect, knex } from '../../../test-helper.js';

describe('Acceptance | Identity Access Management | Scripts | backfill-anonymized-users', function () {
  it('backfills the anonymized users', async function () {
    // given
    const admin = databaseBuilder.factory.buildUser.withRole();
    const legacyAnonymizedUser = databaseBuilder.factory.buildUser({
      firstName: 'Jane',
      hasBeenAnonymised: true,
      hasBeenAnonymisedBy: admin.id,
    });
    const userNotAnonymized = databaseBuilder.factory.buildUser({
      firstName: 'Jack',
      hasBeenAnonymised: false,
    });
    await databaseBuilder.commit();

    // when
    await backfillAnonymizedUsers();

    // then
    const anonymizedUser = await knex('users').where({ id: legacyAnonymizedUser.id }).first();
    expect(anonymizedUser.firstName).to.be.equal('(anonymised)');
    expect(anonymizedUser.hasBeenAnonymised).to.be.true;
    expect(anonymizedUser.hasBeenAnonymisedBy).to.be.equal(admin.id);

    const notAnonymizedUser = await knex('users').where({ id: userNotAnonymized.id }).first();
    expect(notAnonymizedUser.firstName).to.be.equal('Jack');
    expect(notAnonymizedUser.hasBeenAnonymised).to.be.false;
  });
});
