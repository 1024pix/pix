import { NotFoundError } from '../../../../../lib/domain/errors.js';
import { UncancellableOrganizationInvitationError } from '../../../../../src/team/domain/errors.js';
import { OrganizationInvitation } from '../../../../../src/team/domain/models/OrganizationInvitation.js';
import { cancelOrganizationInvitation } from '../../../../../src/team/domain/usecases/cancel-organization-invitation.js';
import { catchErr, domainBuilder, expect, sinon } from '../../../../test-helper.js';

describe('Unit | Team | Domain | UseCase | cancel-organization-invitation', function () {
  let organizationInvitationRepository;

  beforeEach(function () {
    organizationInvitationRepository = {
      get: sinon.stub(),
      markAsCancelled: sinon.stub(),
    };
  });

  context("when invitation doesn't exist", function () {
    it('throws an error', async function () {
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
      it('throws an uncancellable organization invitation error', async function () {
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
      it('returns the cancelled organization invitation', async function () {
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
