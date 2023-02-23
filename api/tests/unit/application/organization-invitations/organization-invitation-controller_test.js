const { expect, sinon, catchErr, domainBuilder } = require('../../../test-helper');

const { MissingQueryParamError } = require('../../../../lib/application/http-errors');
const organizationInvitationController = require('../../../../lib/application/organization-invitations/organization-invitation-controller');
const usecases = require('../../../../lib/domain/usecases/index.js');
const organizationInvitationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/organization-invitation-serializer');

describe('Unit | Application | Organization-Invitations | organization-invitation-controller', function () {
  describe('#acceptOrganizationInvitation', function () {
    it('should call acceptOrganizationInvitation usecase to accept invitation with organizationInvitationId and code', async function () {
      // given
      const code = 'ABCDEFGH01';
      const email = 'random@email.com';
      const organizationInvitation = domainBuilder.buildOrganizationInvitation({ code, email });
      const request = {
        params: { id: organizationInvitation.id },
        payload: {
          data: {
            type: 'organization-invitations',
            attributes: { code, email: email.toUpperCase() },
          },
        },
      };

      sinon.stub(usecases, 'acceptOrganizationInvitation').resolves();
      sinon.stub(usecases, 'createCertificationCenterMembershipForScoOrganizationMember').resolves();

      // when
      await organizationInvitationController.acceptOrganizationInvitation(request);

      // then
      expect(usecases.acceptOrganizationInvitation).to.have.been.calledWith({
        organizationInvitationId: organizationInvitation.id,
        code,
        email,
      });
    });

    it('should call createCertificationCenterMembershipForScoOrganizationMember usecase to create certification center membership', async function () {
      // given
      const code = 'ABCDEFGH01';
      const email = 'random@email.com';
      const organizationInvitation = domainBuilder.buildOrganizationInvitation({ code, email });
      const membership = domainBuilder.buildMembership();
      const request = {
        params: { id: organizationInvitation.id },
        payload: {
          data: {
            type: 'organization-invitations',
            attributes: { code, email },
          },
        },
      };

      sinon.stub(usecases, 'acceptOrganizationInvitation').resolves(membership);
      sinon.stub(usecases, 'createCertificationCenterMembershipForScoOrganizationMember').resolves();

      // when
      await organizationInvitationController.acceptOrganizationInvitation(request);

      // then
      expect(usecases.createCertificationCenterMembershipForScoOrganizationMember).to.have.been.calledWith({
        membership,
      });
    });
  });

  describe('#getOrganizationInvitation', function () {
    it('should call the usecase to get invitation with organizationInvitationId, organizationInvitationCode', async function () {
      // given
      const organizationInvitationId = 1;
      const organizationInvitationCode = 'ABCDEFGH01';
      const request = {
        params: { id: organizationInvitationId },
        query: { code: organizationInvitationCode },
      };

      sinon.stub(usecases, 'getOrganizationInvitation').resolves();
      sinon.stub(organizationInvitationSerializer, 'serialize').returns();

      // when
      await organizationInvitationController.getOrganizationInvitation(request);

      // then
      expect(usecases.getOrganizationInvitation).to.have.been.calledWith({
        organizationInvitationId,
        organizationInvitationCode,
      });
    });

    it('should throw a MissingQueryParamError when code is not defined', async function () {
      // given
      const organizationInvitationId = 1;
      const request = {
        params: { id: organizationInvitationId },
        query: { code: undefined },
      };

      // when
      const errorCatched = await catchErr(organizationInvitationController.getOrganizationInvitation)(request);

      // then
      expect(errorCatched).to.be.instanceof(MissingQueryParamError);
    });
  });
});
