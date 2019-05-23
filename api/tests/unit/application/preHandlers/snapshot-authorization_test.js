const { sinon, expect, hFake } = require('../../../test-helper');
const snapshotAuthorization = require('../../../../lib/application/preHandlers/snapshot-authorization');
const tokenService = require('../../../../lib/domain/services/token-service');
const organizationRepository = require('../../../../lib/infrastructure/repositories/organization-repository');

describe('Unit | Pre-handler | Snapshot Authorization', () => {

  describe('#verify', () => {
    const request = {
      headers: { },
      params: {
        id: 8,
      },
      query: {
        userToken: 'VALID-TOKEN'
      }
    };

    beforeEach(() => {
      sinon.stub(tokenService, 'extractTokenFromAuthChain');
      sinon.stub(tokenService, 'extractUserId');
      sinon.stub(organizationRepository, 'findByUserId');
    });

    it('should get userId from token in queryString', () => {
      // given
      tokenService.extractUserId.returns('userId');
      organizationRepository.findByUserId.resolves([{ get: () => 8 }]);

      // when
      const promise = snapshotAuthorization.verify(request, hFake);

      // then
      return promise.then(() => {
        sinon.assert.calledOnce(tokenService.extractUserId);
        sinon.assert.calledWith(tokenService.extractUserId, request.query.userToken);
      });
    });

    describe('When snapshot is linked to userId (userId exist)', () => {

      it('should reply', () => {
        // given
        const fetchedOrganization = [{ get: () => 8 }];
        const extractedUserId = 'userId';
        tokenService.extractUserId.returns(extractedUserId);
        organizationRepository.findByUserId.resolves(fetchedOrganization);

        // when
        const promise = snapshotAuthorization.verify(request, hFake);

        // then
        return promise.then(() => {
          sinon.assert.calledOnce(organizationRepository.findByUserId);
          sinon.assert.calledWith(organizationRepository.findByUserId, extractedUserId);
        });
      });
    });

    describe('When userId (from token) is not linked to organization', () => {
      it('should take over the request and response with 403 status code', async () => {
        // XXX should take over to avoid the call of controller

        // given
        const extractedUserId = null;

        tokenService.extractUserId.returns(extractedUserId);
        organizationRepository.findByUserId.resolves([]);

        // when
        const response = await snapshotAuthorization.verify(request, hFake);

        // then
        expect(response.statusCode).to.equal(403);
        expect(response.isTakeOver).to.be.true;
      });
    });
  });
});
