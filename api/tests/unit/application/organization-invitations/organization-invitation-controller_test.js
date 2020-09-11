const { expect, sinon, catchErr } = require('../../../test-helper');

const { MissingQueryParamError } = require('../../../../lib/application/http-errors');
const organizationInvitationController = require('../../../../lib/application/organization-invitations/organization-invitation-controller');
const usecases = require('../../../../lib/domain/usecases');
const organizationInvitationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/organization-invitation-serializer');

describe('Unit | Application | Organization-Invitations | organization-invitation-controller', () => {

  let request;

  describe('#acceptOrganizationInvitation', () => {

    const organizationInvitationId = 1;
    const code = 'ABCDEFGH01';
    const email = 'random@email.com';

    beforeEach(() => {
      request = {
        params: { id: organizationInvitationId },
        payload: {
          data: {
            type: 'organization-invitations',
            attributes: { code, email },
          },
        },
      };

      sinon.stub(usecases, 'acceptOrganizationInvitation');
    });

    it('should call the usecase to accept invitation with organizationInvitationId and code', async () => {
      // given
      usecases.acceptOrganizationInvitation.resolves();

      // when
      await organizationInvitationController.acceptOrganizationInvitation(request);

      // then
      expect(usecases.acceptOrganizationInvitation).to.have.been.calledWith({
        organizationInvitationId, code, email });
    });
  });

  describe('#getOrganizationInvitation', () => {

    const organizationInvitationId = 1;
    const organizationInvitationCode = 'ABCDEFGH01';

    beforeEach(() => {
      request = {
        params: { id: organizationInvitationId },
        query: { code: organizationInvitationCode },
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
