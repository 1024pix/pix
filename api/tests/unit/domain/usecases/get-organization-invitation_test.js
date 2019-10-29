const { expect, sinon, domainBuilder, catchErr } = require('../../../test-helper');
const getOrganizationInvitation = require('../../../../lib/domain/usecases/get-organization-invitation');
const OrganizationInvitation = require('../../../../lib/domain/models/OrganizationInvitation');
const { NotFoundError, AlreadyExistingOrganizationInvitationError } = require('../../../../lib/domain/errors');

describe('Unit | UseCase | get-organization-invitation', () => {

  let organizationInvitationRepository;
  let organizationRepository;

  beforeEach(() => {
    organizationInvitationRepository = {
      getByIdAndCode: sinon.stub(),
    };
    organizationRepository = {
      get: sinon.stub(),
    };
  });

  context('when invitation with id and code does not exist', () => {

    it('should throw a NotFoundError', async () => {
      // given
      organizationInvitationRepository.getByIdAndCode.rejects(new NotFoundError());

      // when
      const error = await catchErr(getOrganizationInvitation)({
        organizationInvitationId: 1,
        code: 'codeNotExist',
        organizationRepository,
        organizationInvitationRepository
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  context('when organization with id does not exist', () => {

    it('should throw a NotFoundError', async () => {
      // given
      const organizationInvitation = domainBuilder.buildOrganizationInvitation();
      organizationInvitationRepository.getByIdAndCode.resolves(organizationInvitation);
      organizationRepository.get.rejects(new NotFoundError());

      // when
      const error = await catchErr(getOrganizationInvitation)({
        organizationInvitationId: 1,
        code: 'codeNotExist',
        organizationRepository,
        organizationInvitationRepository
      });

      // then
      expect(error).to.be.instanceOf(NotFoundError);
    });
  });

  context('when invitation is already accepted', () => {

    it('should throw an AlreadyExistingOrganizationInvitationError', async () => {
      // given
      const status = OrganizationInvitation.StatusType.ACCEPTED;
      const organizationInvitation = domainBuilder.buildOrganizationInvitation({ status });
      organizationInvitationRepository.getByIdAndCode.resolves(organizationInvitation);

      // when
      const err = await catchErr(getOrganizationInvitation)({
        organizationInvitationId: organizationInvitation.id,
        organizationRepository,
        organizationInvitationRepository
      });

      // then
      expect(err).to.be.instanceOf(AlreadyExistingOrganizationInvitationError);
    });
  });

  context('when invitation is not accepted yet', () => {

    it('should return found organization invitation', async () => {
      // given
      const organization = domainBuilder.buildOrganization();
      const organizationInvitationPending = domainBuilder.buildOrganizationInvitation({
        status: OrganizationInvitation.StatusType.PENDING,
        organizationId: organization.id,
        organizationName: null
      });
      const expectedOrganizationInvitation = { ...organizationInvitationPending, organizationName: organization.name };

      const { id: organizationInvitationId, code: organizationInvitationCode } = organizationInvitationPending;
      organizationInvitationRepository.getByIdAndCode.resolves(organizationInvitationPending);
      organizationRepository.get.resolves(organization);

      // when
      const result = await getOrganizationInvitation({
        organizationInvitationId, organizationInvitationCode,
        organizationRepository,
        organizationInvitationRepository
      });

      // then
      expect(result).to.deep.equal(expectedOrganizationInvitation);
    });
  });

});
