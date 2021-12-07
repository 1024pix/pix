const { expect, sinon, catchErr, hFake } = require('../../../test-helper');
const usecases = require('../../../../lib/domain/usecases');
const certificationCandidateController = require('../../../../lib/application/certification-candidates/certification-candidates-controller');
const { featureToggles } = require('../../../../lib/config');
const { NotFoundError } = require('../../../../lib/application/http-errors');

describe('Unit | Controller | certifications-candidate-controller', function () {
  describe('#authorizeToStart', function () {
    describe('when FT_END_TEST_SCREEN_REMOVAL_ENABLED is enabled', function () {
      it('should return a 204 status code', async function () {
        // given
        sinon.stub(featureToggles, 'isEndTestScreenRemovalEnabled').value(true);
        const request = {
          auth: {
            credentials: { userId: '111' },
          },
          params: {
            id: 99,
          },
          payload: { 'authorized-to-start': true },
        };

        usecases.authorizeCertificationCandidateToStart = sinon.stub().rejects();
        usecases.authorizeCertificationCandidateToStart
          .withArgs({
            certificationCandidateForSupervisingId: 99,
            authorizedToStart: true,
          })
          .resolves();

        // when
        const response = await certificationCandidateController.authorizeToStart(request, hFake);

        // then
        expect(response.statusCode).to.equal(204);
      });
    });

    describe('when FT_END_TEST_SCREEN_REMOVAL_ENABLED is not enabled', function () {
      it('should return a 404 status code', async function () {
        // given
        sinon.stub(featureToggles, 'isEndTestScreenRemovalEnabled').value(false);

        const request = {
          auth: {
            credentials: { userId: '111' },
          },
          params: {
            id: 99,
          },
          payload: { 'authorized-to-start': true },
        };

        // when
        const error = await catchErr(certificationCandidateController.authorizeToStart)(request, hFake);

        // then
        expect(error).to.be.an.instanceOf(NotFoundError);
      });
    });
  });
});
