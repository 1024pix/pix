import { expect, sinon, knex, databaseBuilder, catchErr } from '../../test-helper';
import { addManyMembersToExistingOrganization } from '../../../scripts/data-generation/add-many-fake-members-related-to-one-organization';
import { ForbiddenAccess } from '../../../lib/domain/errors';

describe('Acceptance | Scripts | add-many-divisions-and-students-to-sco-organization', function () {
  it('should throw an error when env is production', async function () {
    // given
    const stub = sinon.stub(process.env, 'NODE_ENV').value('production');

    // when
    const error = await catchErr(addManyMembersToExistingOrganization)({ numberOfUsers: 1 });

    // then
    expect(error).to.be.an.instanceOf(ForbiddenAccess);
    stub.restore();
  });

  it('should create an user and the membership related to the organization', async function () {
    // given
    const numberOfUsers = 2;
    const organizationRole = 'MEMBER';
    const userId = 45678902;
    const userId2 = 45678903;
    const organizationId = 234567890;

    databaseBuilder.factory.buildOrganization({ id: organizationId });
    await databaseBuilder.commit();

    const stub = sinon
      .stub(process, 'argv')
      .value(['One argument', 'Another argument', numberOfUsers, organizationId, organizationRole, userId]);

    // when
    await addManyMembersToExistingOrganization({ numberOfUsers });

    // then
    const user = await knex('users').where('id', userId).first();
    expect(user.firstName).to.equal('firstName45678902');
    expect(user.lastName).to.equal('lastName45678902');
    expect(user.email).to.equal('firstname.lastname-45678902@example.net');

    const memberShip = await knex('memberships').where('userId', userId).first();
    expect(memberShip.organizationRole).to.equal(organizationRole);
    expect(memberShip.organizationId).to.equal(organizationId);

    await knex('memberships').whereIn('userId', [userId, userId2]).delete();
    await knex('users').whereIn('id', [userId, userId2]).delete();
    stub.restore();
  });
});
