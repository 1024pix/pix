const { expect, sinon, HttpTestServer } = require('../../../test-helper');

const usecases = require('../../../../lib/domain/usecases');
const OrganizationInvitation = require('../../../../lib/domain/models/OrganizationInvitation');
const moduleUnderTest = require('../../../../lib/application/organization-invitations');

describe('Integration | Application | Organization-invitations | organization-invitation-controller', () => {

  let sandbox;
  let httpTestServer;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(usecases, 'answerToOrganizationInvitation');

    httpTestServer = new HttpTestServer(moduleUnderTest);
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#answerToOrganizationInvitation', () => {

    const status = OrganizationInvitation.StatusType.ACCEPTED;
    const temporaryKey = 'temporaryKey';

    const payload = {
      data: {
        type: 'organization-invitations',
        attributes: {
          temporaryKey,
          status
        },
      }
    };

    context('Success cases', () => {

      it('should return an HTTP response with status code 200', async () => {
        // given
        usecases.answerToOrganizationInvitation.resolves();

        // when
        const response = await httpTestServer.request('POST', '/api/organization-invitations/1/response', payload);

        // then
        expect(response.statusCode).to.equal(200);
      });
    });

    // TODO HTTP Error cases

  });

});
