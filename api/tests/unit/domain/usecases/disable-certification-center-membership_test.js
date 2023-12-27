import { catchErr, domainBuilder, expect, sinon } from '../../../test-helper.js';
import { NotFoundError } from '../../../../lib/domain/errors.js';
import { disableCertificationCenterMembership } from '../../../../lib/domain/usecases/disable-certification-center-membership.js';
import { ForbiddenError } from '../../../../lib/application/http-errors.js';

describe('Unit | UseCase | disable-certification-center-membership', function () {
  let certificationCenterMembershipRepository;
  let clock;
  const certificationCenterMembershipId = 100;
  const certificationCenterId = 101;
  const updatedByUserId = 10;

  beforeEach(function () {
    const now = new Date('2023-12-15T14:57:12Z');

    certificationCenterMembershipRepository = {
      findActiveAdminsByCertificationCenterId: sinon.stub(),
      findById: sinon.stub(),
      update: sinon.stub(),
    };
    clock = sinon.useFakeTimers({ now, toFake: ['Date'] });
  });

  afterEach(function () {
    clock.restore();
  });

  context('when certification-center-membership does not exist', function () {
    it('throws a NotFoundError', async function () {
      // given
      certificationCenterMembershipRepository.findById.resolves(undefined);

      // when
      const error = await catchErr(disableCertificationCenterMembership)({
        certificationCenterMembershipId,
        updatedByUserId,
        certificationCenterMembershipRepository,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
      expect(certificationCenterMembershipRepository.findById).to.have.been.called;
      expect(certificationCenterMembershipRepository.findActiveAdminsByCertificationCenterId).to.not.have.been.called;
    });
  });
  context('when certification-center-membership exists', function () {
    let certificationCenterMembership;

    beforeEach(function () {
      certificationCenterMembership = domainBuilder.buildCertificationCenterMembership({
        id: 100,
        user: domainBuilder.buildUser({
          id: 4567,
        }),
        certificationCenter: domainBuilder.buildCertificationCenter({
          id: certificationCenterId,
        }),
      });
    });

    context('when certification-center-membership has a role "MEMBER"', function () {
      it('disables the certification-center-membership', async function () {
        // given
        certificationCenterMembership.role = 'MEMBER';

        certificationCenterMembershipRepository.findById.resolves(certificationCenterMembership);
        const updatedFieldsOfCertificationCenterMembership = {
          disabledAt: new Date(),
          updatedByUserId,
          updatedAt: new Date(),
        };

        // when
        await disableCertificationCenterMembership({
          certificationCenterMembershipId,
          updatedByUserId,
          certificationCenterMembershipRepository,
        });

        // then
        expect(certificationCenterMembershipRepository.findById).to.have.been.called;
        expect(certificationCenterMembershipRepository.update).to.have.been.calledWithMatch(
          updatedFieldsOfCertificationCenterMembership,
        );
        expect(certificationCenterMembershipRepository.findActiveAdminsByCertificationCenterId).to.not.have.been.called;
      });
    });
    context('when certification-center-membership has a role "ADMIN"', function () {
      let otherAdminMembership;
      beforeEach(function () {
        certificationCenterMembership.role = 'ADMIN';
        otherAdminMembership = domainBuilder.buildCertificationCenterMembership({
          role: 'ADMIN',
          certificationCenter: {
            id: certificationCenterId,
          },
          user: {
            id: 100,
          },
        });

        certificationCenterMembershipRepository.findById.resolves(certificationCenterMembership);
      });
      context('when certification-center have at least 2 admins', function () {
        it('disables the certification-center-membership', async function () {
          // given
          const adminMembershipsOfCertificationCenter = [certificationCenterMembership, otherAdminMembership];

          certificationCenterMembershipRepository.findActiveAdminsByCertificationCenterId.resolves(
            adminMembershipsOfCertificationCenter,
          );

          const updatedFieldsOfCertificationCenterMembership = {
            disabledAt: new Date(),
            updatedByUserId,
            updatedAt: new Date(),
          };

          // when
          await disableCertificationCenterMembership({
            certificationCenterMembershipId,
            updatedByUserId,
            certificationCenterMembershipRepository,
          });

          // then
          expect(certificationCenterMembershipRepository.findById).to.have.been.called;
          expect(certificationCenterMembershipRepository.update).to.have.been.calledWithMatch(
            updatedFieldsOfCertificationCenterMembership,
          );
          expect(
            certificationCenterMembershipRepository.findActiveAdminsByCertificationCenterId,
          ).have.been.calledWithExactly(certificationCenterId);
        });
      });
      context('when certification-center have only 1 admin', function () {
        it('throws a forbidden error', async function () {
          // given
          certificationCenterMembershipRepository.findActiveAdminsByCertificationCenterId.resolves([
            certificationCenterMembership,
          ]);

          // when
          const error = await catchErr(disableCertificationCenterMembership)({
            certificationCenterMembershipId,
            updatedByUserId,
            certificationCenterMembershipRepository,
          });

          // then
          expect(error).to.be.instanceOf(ForbiddenError);
          expect(certificationCenterMembershipRepository.findById).to.have.been.called;
          expect(certificationCenterMembershipRepository.update).to.not.have.been.called;
          expect(
            certificationCenterMembershipRepository.findActiveAdminsByCertificationCenterId,
          ).have.been.calledWithExactly(certificationCenterId);
        });
      });
    });
  });
});
