import sinon from 'sinon';

import { ForbiddenError } from '../../../../../src/shared/application/http-errors.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { Membership } from '../../../../../src/shared/domain/models/Membership.js';
import { usecases } from '../../../../../src/team/domain/usecases/index.js';
import * as membershipRepository from '../../../../../src/team/infrastructure/repositories/membership.repository.js';

import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Team | UseCases | update-membership-last-accessed-at', function () {
  let clock;
  const now = new Date('2022-12-01');

  beforeEach(function () {
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  context('when the membership does not exist', function () {
    it('throws a NotFoundError', async function () {
      // given
      const membershipId = 4567;
      const userId = 1234;

      // when
      const error = await catchErr(usecases.updateMembershipLastAccessedAt)({
        membershipId,
        userId,
        membershipRepository,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  context('when the membership is disabled', function () {
    it('throws a ForbiddenError', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const userId = databaseBuilder.factory.buildUser().id;

      const membershipId = databaseBuilder.factory.buildMembership({
        organizationId,
        userId,
        organizationRole: Membership.roles.MEMBER,
        disabledAt: new Date(),
      }).id;

      await databaseBuilder.commit();

      // when
      const error = await catchErr(usecases.updateMembershipLastAccessedAt)({
        membershipId,
        userId,
        membershipRepository,
      });

      // then
      expect(error).to.be.instanceOf(ForbiddenError);
    });
  });

  context('when the membership does not belong to the user', function () {
    it('throws a ForbiddenError', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const userId = databaseBuilder.factory.buildUser().id;
      const anotherUserId = databaseBuilder.factory.buildUser().id;

      const membershipId = databaseBuilder.factory.buildMembership({
        organizationId,
        userId,
        organizationRole: Membership.roles.MEMBER,
      }).id;

      await databaseBuilder.commit();

      // when
      const error = await catchErr(usecases.updateMembershipLastAccessedAt)({
        membershipId,
        userId: anotherUserId,
        membershipRepository,
      });

      // then
      expect(error).to.be.instanceOf(ForbiddenError);
    });
  });

  it('updates membership lastAccessedAt', async function () {
    // given
    const organizationId = databaseBuilder.factory.buildOrganization().id;
    const userId = databaseBuilder.factory.buildUser().id;

    const membershipId = databaseBuilder.factory.buildMembership({
      organizationId,
      userId,
      organizationRole: Membership.roles.MEMBER,
      lastAccessedAt: null,
      disabledAt: null,
    }).id;

    await databaseBuilder.commit();

    // when
    await usecases.updateMembershipLastAccessedAt({
      userId,
      membershipId,
      membershipRepository,
    });

    // then
    const membership = await knex('memberships').where({ id: membershipId }).first();
    expect(membership.lastAccessedAt).to.deep.equal(now);
    expect(membership.updatedAt).to.deep.equal(now);
  });
});
