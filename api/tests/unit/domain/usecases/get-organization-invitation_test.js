import { expect, sinon, domainBuilder, catchErr } from '../../../test-helper';
import getOrganizationInvitation from '../../../../lib/domain/usecases/get-organization-invitation';
import OrganizationInvitation from '../../../../lib/domain/models/OrganizationInvitation';
import { NotFoundError, AlreadyExistingInvitationError, CancelledInvitationError } from '../../../../lib/domain/errors';

describe('Unit | UseCase | get-organization-invitation', function () {
  let organizationInvitationRepository;
  let organizationRepository;

  beforeEach(function () {
    organizationInvitationRepository = {
      getByIdAndCode: sinon.stub(),
    };
    organizationRepository = {
      get: sinon.stub(),
    };
  });

  context('when invitation with id and code does not exist', function () {
    it('should throw a NotFoundError', async function () {
      // given
      organizationInvitationRepository.getByIdAndCode.rejects(new NotFoundError());

      // when
      const error = await catchErr(getOrganizationInvitation)({
        organizationInvitationId: 1,
        code: 'codeNotExist',
        organizationRepository,
        organizationInvitationRepository,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  context('when organization with id does not exist', function () {
    it('should throw a NotFoundError', async function () {
      // given
      const organizationInvitation = domainBuilder.buildOrganizationInvitation();
      organizationInvitationRepository.getByIdAndCode.resolves(organizationInvitation);
      organizationRepository.get.rejects(new NotFoundError());

      // when
      const error = await catchErr(getOrganizationInvitation)({
        organizationInvitationId: 1,
        code: 'codeNotExist',
        organizationRepository,
        organizationInvitationRepository,
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  context('when invitation is already accepted', function () {
    it('should throw an AlreadyExistingInvitationError', async function () {
      // given
      const status = OrganizationInvitation.StatusType.ACCEPTED;
      const organizationInvitation = domainBuilder.buildOrganizationInvitation({ status });
      organizationInvitationRepository.getByIdAndCode.resolves(organizationInvitation);

      // when
      const err = await catchErr(getOrganizationInvitation)({
        organizationInvitationId: organizationInvitation.id,
        organizationRepository,
        organizationInvitationRepository,
      });

      // then
      expect(err).to.be.instanceOf(AlreadyExistingInvitationError);
    });
  });

  context('when invitation is not accepted yet', function () {
    it('should return found organization invitation', async function () {
      // given
      const organization = domainBuilder.buildOrganization();
      const organizationInvitationPending = domainBuilder.buildOrganizationInvitation({
        status: OrganizationInvitation.StatusType.PENDING,
        organizationId: organization.id,
        organizationName: null,
      });
      const expectedOrganizationInvitation = { ...organizationInvitationPending, organizationName: organization.name };

      const { id: organizationInvitationId, code: organizationInvitationCode } = organizationInvitationPending;
      organizationInvitationRepository.getByIdAndCode.resolves(organizationInvitationPending);
      organizationRepository.get.resolves(organization);

      // when
      const result = await getOrganizationInvitation({
        organizationInvitationId,
        organizationInvitationCode,
        organizationRepository,
        organizationInvitationRepository,
      });

      // then
      expect(result).to.deep.equal(expectedOrganizationInvitation);
    });

    context('when invitation is cancelled', function () {
      it('should throw an CancelledInvitationError', async function () {
        // given
        const status = OrganizationInvitation.StatusType.CANCELLED;
        const organization = domainBuilder.buildOrganization();
        const organizationInvitation = domainBuilder.buildOrganizationInvitation({
          organizationId: organization.id,
          organizationName: organization.name,
          status,
        });
        organizationInvitationRepository.getByIdAndCode.resolves(organizationInvitation);
        organizationRepository.get.resolves(organization);

        // when
        const error = await catchErr(getOrganizationInvitation)({
          organizationInvitationId: organizationInvitation.id,
          organizationRepository,
          organizationInvitationRepository,
        });

        // then
        expect(error).to.be.instanceOf(CancelledInvitationError);
      });
    });
  });
});
