const { catchErr, expect, sinon, hFake } = require('../../../test-helper');
const endTestScreenRemovalEnabled = require('../../../../lib/application/preHandlers/end-test-screen-removal-enabled');
const endTestScreenRemovalService = require('../../../../lib/domain/services/end-test-screen-removal-service');
const { SupervisorAccessNotAuthorizedError } = require('../../../../lib/domain/errors');

describe('Unit | Pre-handler | end test screen removal', function () {
  describe('#verifyBySessionId', function () {
    beforeEach(function () {
      sinon.stub(endTestScreenRemovalService, 'isEndTestScreenRemovalEnabledBySessionId');
    });

    context('When POST', function () {
      describe('When session certification center is in the whitelist', function () {
        it('should return true', async function () {
          // given
          const request = {
            payload: {
              data: { attributes: { 'session-id': 8 } },
            },
          };
          endTestScreenRemovalService.isEndTestScreenRemovalEnabledBySessionId.withArgs(8).resolves(true);

          // when
          const response = await endTestScreenRemovalEnabled.verifyBySessionId(request, hFake);

          // then
          expect(response).to.be.true;
        });
      });

      describe('When session certification center is not in the whitelist', function () {
        it('should throw', async function () {
          // given
          const request = {
            payload: {
              data: { attributes: { 'session-id': 8 } },
            },
          };
          endTestScreenRemovalService.isEndTestScreenRemovalEnabledBySessionId.withArgs(8).resolves(false);

          // when
          const error = await catchErr(endTestScreenRemovalEnabled.verifyBySessionId)(request, hFake);

          // then
          expect(error).to.be.instanceOf(SupervisorAccessNotAuthorizedError);
        });
      });
    });
    context('When GET', function () {
      describe('When session certification center is in the whitelist', function () {
        it('should return true', async function () {
          // given
          const request = {
            params: {
              id: 8,
            },
          };
          endTestScreenRemovalService.isEndTestScreenRemovalEnabledBySessionId.withArgs(8).resolves(true);

          // when
          const response = await endTestScreenRemovalEnabled.verifyBySessionId(request, hFake);

          // then
          expect(response).to.be.true;
        });
      });

      describe('When session certification center is not in the whitelist', function () {
        it('should throw', async function () {
          // given
          const request = {
            params: {
              id: 8,
            },
          };
          endTestScreenRemovalService.isEndTestScreenRemovalEnabledBySessionId.withArgs(8).resolves(false);

          // when
          const error = await catchErr(endTestScreenRemovalEnabled.verifyBySessionId)(request, hFake);

          // then
          expect(error).to.be.instanceOf(SupervisorAccessNotAuthorizedError);
        });
      });
    });
  });

  describe('#verifyByCertificationCandidateId', function () {
    const request = {
      params: {
        id: 5,
      },
    };

    beforeEach(function () {
      sinon.stub(endTestScreenRemovalService, 'isEndTestScreenRemovalEnabledByCandidateId');
    });

    describe("When candidate's certification center is in the whitelist", function () {
      it('should return true', async function () {
        // given
        endTestScreenRemovalService.isEndTestScreenRemovalEnabledByCandidateId.withArgs(5).resolves(true);

        // when
        const response = await endTestScreenRemovalEnabled.verifyByCertificationCandidateId(request, hFake);

        // then
        expect(response).to.be.true;
      });
    });

    describe("When candidate's certification center is not in the whitelist", function () {
      it('should return a 404 status code', async function () {
        // given
        endTestScreenRemovalService.isEndTestScreenRemovalEnabledByCandidateId.withArgs(5).resolves(false);

        // when
        const response = await endTestScreenRemovalEnabled.verifyByCertificationCandidateId(request, hFake);

        // then
        expect(response.statusCode).to.equal(404);
      });
    });
  });
});
