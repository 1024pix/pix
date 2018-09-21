const { sinon, expect } = require('../../../test-helper');

const campaignParticipationController = require('../../../../lib/application/campaignParticipations/campaign-participation-controller');
const { NotFoundError } = require('../../../../lib/domain/errors');
const tokenService = require('../../../../lib/domain/services/token-service');
const usecases = require('../../../../lib/domain/usecases');

describe('Unit | Application | Controller | Campaign-Participation', () => {

  describe('#shareCampaignResult', () => {

    let sandbox;
    let replyStub;
    let codeStub;
    const userId = 1;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      sandbox.stub(usecases, 'allowUserToShareHisCampaignResult');
      sandbox.stub(tokenService, 'extractTokenFromAuthChain').resolves();
      sandbox.stub(tokenService, 'extractUserId').resolves(userId);
      codeStub = sandbox.stub();
      replyStub = sandbox.stub().returns({
        code: codeStub
      });
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should call the use case to share campaign result', () => {
      // given
      const request = {
        params: {
          assessmentId: '5'
        },
        headers: {
          authorization: 'token'
        },
      };
      usecases.allowUserToShareHisCampaignResult.resolves();

      // when
      const promise = campaignParticipationController.shareCampaignResult(request, replyStub);

      // then
      return promise.then(() => {
        expect(usecases.allowUserToShareHisCampaignResult).to.have.been.calledOnce;
        const updateCampaignParticiaption = usecases.allowUserToShareHisCampaignResult.firstCall.args[0];
        expect(updateCampaignParticiaption).to.have.property('assessmentId');
        expect(updateCampaignParticiaption).to.have.property('userId');
        expect(updateCampaignParticiaption).to.have.property('campaignParticipationRepository');
      });
    });

    context('when the request is invalid', () => {

      it('should return a 400 status code', () => {
        // given
        const paramsWithMissingAssessmentId = {};
        const request = {
          params: paramsWithMissingAssessmentId,
          headers: {
            authorization: 'token'
          },
        };

        // when
        campaignParticipationController.shareCampaignResult(request, replyStub);

        // then
        expect(codeStub).to.have.been.calledWith(400);
        expect(replyStub).to.have.been.calledWith({
          errors: [{
            detail: 'assessmentId manquant',
            status: '400',
            title: 'Bad Request',
          }]
        });
      });

      it('should return a 404 status code if the participation is not found', () => {
        // given
        const nonExistingAssessmentId = 1789;
        const request = {
          params: {
            assessmentId: nonExistingAssessmentId,
          },
          headers: {
            authorization: 'token'
          },
        };
        usecases.allowUserToShareHisCampaignResult.rejects(new NotFoundError());

        // when
        const promise = campaignParticipationController.shareCampaignResult(request, replyStub);

        // then
        return promise.then(() => {
          expect(codeStub).to.have.been.calledWith(404);
          expect(replyStub).to.have.been.calledWith({
            errors: [{
              detail: 'Participation non trouvée',
              status: '404',
              title: 'Not Found',
            }]
          });
        });
      });
    });

    context('when the request comes from a different user', () => {

      beforeEach(() => {

      });

      it('should return a 403 status code', () => {
        // given
        const request = {
          params: {
            assessmentId: '5'
          },
          headers: {
            authorization: 'token'
          },
        };
        usecases.allowUserToShareHisCampaignResult.resolves();

        // when
        const promise = campaignParticipationController.shareCampaignResult(request, replyStub);

        // then
        return promise.then(() => {
          expect(usecases.allowUserToShareHisCampaignResult).to.have.been.calledOnce;
          const updateCampaignParticiaption = usecases.allowUserToShareHisCampaignResult.firstCall.args[0];
          expect(updateCampaignParticiaption).to.have.property('assessmentId');
          expect(updateCampaignParticiaption).to.have.property('userId');
          expect(updateCampaignParticiaption).to.have.property('campaignParticipationRepository');
        });
      });
    });
  });
});
