const { expect, sinon } = require('../../../test-helper');

const organizationInvitationController = require('../../../../lib/application/organization-invitations/organization-invitation-controller');
const usecases = require('../../../../lib/domain/usecases');
const OrganizationInvitation = require('../../../../lib/domain/models/OrganizationInvitation');

describe('Unit | Application | Organization-Invitations | organization-invitation-controller', () => {

  let request;

  describe('#answerToOrganizationInvitation', () => {

    const organizationInvitationId = 1;
    const code = 'ABCDEFGH01';
    const status = OrganizationInvitation.StatusType.ACCEPTED;

    beforeEach(() => {
      request = {
        params: { id: organizationInvitationId },
        payload: {
          data: {
            type: 'organization-invitations',
            attributes: { code, status },
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
        organizationInvitationId, code, status });
    });
  });

});
