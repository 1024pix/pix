const { expect, sinon, catchErr } = require('../../../test-helper');

const { MissingQueryParamError } = require('../../../../lib/application/http-errors');
const organizationInvitationController = require('../../../../lib/application/organization-invitations/organization-invitation-controller');
const usecases = require('../../../../lib/domain/usecases');
const OrganizationInvitation = require('../../../../lib/domain/models/OrganizationInvitation');
const organizationInvitationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/organization-invitation-serializer');

describe('Unit | Application | Organization-Invitations | organization-invitation-controller', () => {

  let request;

  describe('#answerToOrganizationInvitation', () => {

    const organizationInvitationId = 1;
    const code = 'ABCDEFGH01';
    const status = OrganizationInvitation.StatusType.ACCEPTED;
    const email = 'random@email.com';

    beforeEach(() => {
      request = {
        params: { id: organizationInvitationId },
        payload: {
          data: {
            type: 'organization-invitations',
            attributes: { code, status, email },
          }
        }
      };

      sinon.stub(usecases, 'answerToOrganizationInvitation');
    });

    it('should call the usecase to update invitation with organizationInvitationId, code and status', async () => {
      // given
      usecases.answerToOrganizationInvitation.resolves();

      // when
      await organizationInvitationController.answerToOrganizationInvitation(request);

      // then
      expect(usecases.answerToOrganizationInvitation).to.have.been.calledWith({
        organizationInvitationId, code, status, email });
    });
  });

  describe('#getOrganizationInvitation', () => {

    const organizationInvitationId = 1;
    const organizationInvitationCode = 'ABCDEFGH01';

    beforeEach(() => {
      request = {
        params: { id: organizationInvitationId },
        query: { code: organizationInvitationCode }
      };

      sinon.stub(usecases, 'getOrganizationInvitation');
      sinon.stub(organizationInvitationSerializer, 'serialize');
    });

    it('should call the usecase to get invitation with organizationInvitationId, organizationInvitationCode', async () => {
      // given
      usecases.getOrganizationInvitation.resolves();
      organizationInvitationSerializer.serialize.returns();

      // when
      await organizationInvitationController.getOrganizationInvitation(request);

      // then
      expect(usecases.getOrganizationInvitation).to.have.been.calledWith({
        organizationInvitationId, organizationInvitationCode });
    });

    it('should throw a MissingQueryParamError when code is not defined', async () => {
      // given
      request.query.code = undefined;

      // when
      const errorCatched = await catchErr(organizationInvitationController.getOrganizationInvitation)(request);

      // then
      expect(errorCatched).to.be.instanceof(MissingQueryParamError);
    });
  });

});
