import { backfillAnonymizedUsers } from '../../../../src/identity-access-management/scripts/backfill-anonymized-users.js';
import { databaseBuilder, expect, knex } from '../../../test-helper.js';

describe('Acceptance | Identity Access Management | Scripts | backfill-anonymized-users', function () {
  it('backfills the anonymized users', async function () {
    // given
    const oldAnonymizedUser = databaseBuilder.factory.buildUser({ hasBeenAnonymised: true, firstName: 'Jane' });
    await databaseBuilder.commit();

    // when
    await backfillAnonymizedUsers();

    // then
    const anonymizedUser = await knex('users').where({ id: oldAnonymizedUser.id }).first();
    expect(anonymizedUser.firstName).to.be.equal('(anonymised)');
  });
});
