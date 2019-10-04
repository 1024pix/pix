const { expect, sinon, hFake } = require('../../../test-helper');

const organizationInvitationController = require('../../../../lib/application/organization-invitations/organization-invitation-controller');
const usecases = require('../../../../lib/domain/usecases');
const OrganizationInvitation = require('../../../../lib/domain/models/OrganizationInvitation');

describe('Unit | Application | Organization-Invitations | organization-invitation-controller', () => {

  let request;

  describe('#answerToOrganizationInvitation', () => {

    const organizationInvitationId = 1;
    const temporaryKey = 'ABCDEF';
    const status = OrganizationInvitation.StatusType.ACCEPTED;

    beforeEach(() => {
      request = {
        params: { id: organizationInvitationId },
        payload: {
          data: {
            type: 'organization-invitations',
            attributes: {
              'temporary-key': temporaryKey,
              status
            },
          }
        }
      };

      sinon.stub(usecases, 'answerToOrganizationInvitation');
    });

    it('should call the usecase to update invitation with organizationInvitationId, temporaryKey and status', async () => {
      // when
      await organizationInvitationController.answerToOrganizationInvitation(request, hFake);

      // then
      expect(usecases.answerToOrganizationInvitation).to.have.been.calledWith({
        organizationInvitationId, temporaryKey, status });
    });
  });

});
