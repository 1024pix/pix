import sinon from 'sinon';

import { ForbiddenError } from '../../../../../src/shared/application/http-errors.js';
import { NotFoundError } from '../../../../../src/shared/domain/errors.js';
import { CERTIFICATION_CENTER_MEMBERSHIP_ROLES } from '../../../../../src/team/domain/models/CertificationCenterMembership.js';
import { usecases } from '../../../../../src/team/domain/usecases/index.js';
import { certificationCenterMembershipRepository } from '../../../../../src/team/infrastructure/repositories/certification-center-membership.repository.js';

import { databaseBuilder, knex } from '../../../../tooling/databases.js';
import { catchErr } from '../../../../tooling/test-utils/error.js';

describe('Integration | Team | UseCases | update-certification-center-membership-last-accessed-at', function () {
  context('when the certification center membership does not exist', function () {
    it('throws a NotFoundError', async function () {
      // given
      const certificationCenterMembershipId = 4567;
      const userId = 1234;

      const error = await catchErr(usecases.updateCertificationCenterMembershipLastAccessedAt)({
        userId,
        certificationCenterMembershipId,
        certificationCenterMembershipRepository,
      });

      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  context('when the user is not the owner of the certification center membership', function () {
    it('throws a ForbiddenError', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const userId = databaseBuilder.factory.buildUser().id;

      const certificationCenterMembershipId = databaseBuilder.factory.buildCertificationCenterMembership({
        certificationCenterId,
        userId,
        certificationCenterRole: CERTIFICATION_CENTER_MEMBERSHIP_ROLES.MEMBER,
      }).id;

      await databaseBuilder.commit();

      const error = await catchErr(usecases.updateCertificationCenterMembershipLastAccessedAt)({
        userId: userId + 1,
        certificationCenterMembershipId,
        certificationCenterMembershipRepository,
      });

      expect(error).to.be.instanceOf(ForbiddenError);
    });
  });

  context('when the certification center membership is disabled', function () {
    it('throws a ForbiddenError', async function () {
      // given
      const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
      const userId = databaseBuilder.factory.buildUser().id;

      const certificationCenterMembershipId = databaseBuilder.factory.buildCertificationCenterMembership({
        certificationCenterId,
        userId,
        certificationCenterRole: CERTIFICATION_CENTER_MEMBERSHIP_ROLES.MEMBER,
        disabledAt: new Date(),
      }).id;

      await databaseBuilder.commit();

      const error = await catchErr(usecases.updateCertificationCenterMembershipLastAccessedAt)({
        userId,
        certificationCenterMembershipId,
        certificationCenterMembershipRepository,
      });

      expect(error).to.be.instanceOf(ForbiddenError);
    });
  });

  it('updates certification center membership lastAccessedAt', async function () {
    // given
    const now = new Date('2021-01-02');
    sinon.useFakeTimers({ now, toFake: ['Date'] });

    const certificationCenterId = databaseBuilder.factory.buildCertificationCenter().id;
    const userId = databaseBuilder.factory.buildUser().id;

    const certificationCenterMembershipId = databaseBuilder.factory.buildCertificationCenterMembership({
      certificationCenterId,
      userId,
      certificationCenterRole: CERTIFICATION_CENTER_MEMBERSHIP_ROLES.MEMBER,
      lastAccessedAt: null,
      disabledAt: null,
    }).id;

    await databaseBuilder.commit();

    // when
    await usecases.updateCertificationCenterMembershipLastAccessedAt({
      userId,
      certificationCenterMembershipId,
      certificationCenterMembershipRepository,
    });

    // then
    const certificationCenterMembership = await knex('certification-center-memberships')
      .where({ userId, certificationCenterId })
      .first();
    expect(certificationCenterMembership.lastAccessedAt).to.deep.equal(now);
  });
});
