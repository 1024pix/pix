const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');
const { NotFoundError, UncancellableOrganizationInvitationError } = require('../../../../lib/domain/errors');
const cancelOrganizationInvitation = require('../../../../lib/domain/usecases/cancel-organization-invitation');
const OrganizationInvitation = require('../../../../lib/domain/models/OrganizationInvitation');

describe('Unit | UseCase | cancel-organization-invitation', function () {
  let organizationInvitationRepository;

  beforeEach(function () {
    organizationInvitationRepository = {
      get: sinon.stub(),
      markAsCancelled: sinon.stub(),
      updateModificationDate: sinon.stub(),
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
      it('should cancel organization invitation and update modification date', async function () {
        // given
        const status = OrganizationInvitation.StatusType.PENDING;
        const organizationInvitation = domainBuilder.buildOrganizationInvitation({ status });
        const organizationInvitationId = organizationInvitation.id;

        organizationInvitationRepository.get.resolves(organizationInvitation);

        // when
        await cancelOrganizationInvitation({
          organizationInvitationId,
          organizationInvitationRepository,
        });

        // then
        expect(organizationInvitationRepository.markAsCancelled).to.have.been.calledWith({
          id: organizationInvitationId,
        });
        expect(organizationInvitationRepository.updateModificationDate).to.have.been.calledWith(
          organizationInvitationId
        );
      });
    });
  });
});
