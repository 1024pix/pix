import { catchErr, domainBuilder, expect, sinon } from '../../../test-helper.js';
import { disableOwnCertificationCenterMembership } from '../../../../lib/domain/usecases/disable-own-certification-center-membership.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';

describe('Unit | Domain | UseCases | disable-own-certification-center-membership', function () {
  let clock;

  beforeEach(function () {
    const now = new Date('2023-12-15T14:57:12Z');
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  it('disables certification center membership', async function () {
    // given
    const certificationCenterMembershipRepository = {
      findByCertificationCenterIdAndUserId: sinon.stub(),
      update: sinon.stub(),
    };
    const certificationCenterId = 456;
    const userId = 654;
    const certificationCenterMembership = domainBuilder.buildCertificationCenterMembership({
      id: 123,
      certificationCenter: domainBuilder.buildCertificationCenter({ id: certificationCenterId }),
      user: domainBuilder.buildUser({ id: userId }),
    });
    const updatedCertificationCenterMembership = domainBuilder.buildCertificationCenterMembership({
      ...certificationCenterMembership,
      disabledAt: new Date(),
      updatedByUserId: userId,
    });

    certificationCenterMembershipRepository.findByCertificationCenterIdAndUserId.resolves(
      certificationCenterMembership,
    );

    // when
    await disableOwnCertificationCenterMembership({
      certificationCenterId,
      userId,
      certificationCenterMembershipRepository,
    });

    // then
    expect(certificationCenterMembershipRepository.findByCertificationCenterIdAndUserId).to.have.been.calledWith({
      certificationCenterId,
      userId,
    });
    expect(certificationCenterMembershipRepository.update).to.have.been.calledWith(
      updatedCertificationCenterMembership,
    );
  });

  context('when there is no certification center membership', function () {
    it('throws a NotFound error', async function () {
      // given
      const certificationCenterMembershipRepository = {
        findByCertificationCenterIdAndUserId: sinon.stub().resolves(null),
      };
      const certificationCenterId = 456;
      const userId = 654;

      // when
      const error = await catchErr(disableOwnCertificationCenterMembership)({
        certificationCenterId,
        userId,
        certificationCenterMembershipRepository,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(error.message).to.equal(
        `No certification center membership found with certificationCenterId: ${certificationCenterId} and userId: ${userId}`,
      );
    });
  });
});
