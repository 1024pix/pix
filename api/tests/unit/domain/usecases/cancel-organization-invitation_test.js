import { expect, sinon, catchErr, domainBuilder } from '../../../test-helper';
import { NotFoundError, UncancellableOrganizationInvitationError } from '../../../../lib/domain/errors';
import cancelOrganizationInvitation from '../../../../lib/domain/usecases/cancel-organization-invitation';
import OrganizationInvitation from '../../../../lib/domain/models/OrganizationInvitation';

describe('Unit | UseCase | cancel-organization-invitation', function () {
  let organizationInvitationRepository;

  beforeEach(function () {
    organizationInvitationRepository = {
      get: sinon.stub(),
      markAsCancelled: sinon.stub(),
    };
  });

  context("when invitation doesn't exist", function () {
    it('should throw an error', async function () {
      // given
      organizationInvitationRepository.get.rejects(new NotFoundError());

      // when
      const error = await catchErr(cancelOrganizationInvitation)({
        organizationInvitationRepository,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  context('when invitation exist ', function () {
    context('when invitation is not pending', function () {
      it('should throw an uncancellable organization invitation error', async function () {
        // given
        const status = OrganizationInvitation.StatusType.ACCEPTED;
        const organizationInvitation = domainBuilder.buildOrganizationInvitation({ status });

        organizationInvitationRepository.get.resolves(organizationInvitation);

        // when
        const error = await catchErr(cancelOrganizationInvitation)({
          organizationInvitationRepository,
        });

        // then
        expect(error).to.be.instanceOf(UncancellableOrganizationInvitationError);
      });
    });

    context('when invitation is pending', function () {
      it('should return the cancelled organization invitation', async function () {
        // given
        const status = OrganizationInvitation.StatusType.PENDING;
        const organizationInvitation = domainBuilder.buildOrganizationInvitation({ status });
        const organizationInvitationId = organizationInvitation.id;
        const cancelledOrganizationInvitation = Symbol('the cancelled invitation');

        organizationInvitationRepository.get.resolves(organizationInvitation);
        organizationInvitationRepository.markAsCancelled
          .withArgs({
            id: organizationInvitationId,
          })
          .resolves(cancelledOrganizationInvitation);

        // when
        const result = await cancelOrganizationInvitation({
          organizationInvitationId,
          organizationInvitationRepository,
        });

        // then
        expect(result).to.be.equal(cancelledOrganizationInvitation);
      });
    });
  });
});
