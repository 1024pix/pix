const { sinon, expect, factory } = require('../../../test-helper');

const campaignParticipationController = require('../../../../lib/application/campaignParticipations/campaign-participation-controller');
const { NotFoundError } = require('../../../../lib/domain/errors');
const serializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign-participation-serializer');
const tokenService = require('../../../../lib/domain/services/token-service');
const usecases = require('../../../../lib/domain/usecases');
const queryParamsUtils = require('../../../../lib/infrastructure/utils/query-params-utils');

describe('Unit | Application | Controller | Campaign-Participation', () => {

  describe('#getCampaignParticipationByAssessment', () => {

    let sandbox;
    let replyStub;
    let codeStub;
    const resultFilter = {
      assessmentId: 4,
    };

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.stub(queryParamsUtils, 'extractFilters').resolves(resultFilter);
      sandbox.stub(usecases, 'findCampaignParticipationsByAssessmentId');
      codeStub = sandbox.stub(serializer, 'serialize').resolves();
      replyStub = sandbox.stub().returns({
        code: codeStub
      });
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should call the usecases to get the campaign participations of the given assessmentId', () => {
      const request = {
        headers: {
          authorization: 'token'
        },
      };
      usecases.findCampaignParticipationsByAssessmentId.resolves();

      // when
      const promise = campaignParticipationController.getCampaignParticipationByAssessment(request, replyStub);

      // then
      return promise.then(() => {
        expect(usecases.findCampaignParticipationsByAssessmentId).to.have.been.calledOnce;
        const findCampaignParticipations = usecases.findCampaignParticipationsByAssessmentId.firstCall.args[0];
        expect(findCampaignParticipations).to.have.property('assessmentId');
      });
    });
  });

  describe('#shareCampaignResult', () => {

    let sandbox;
    let replyStub;
    let codeStub;
    const userId = 1;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      sandbox.stub(usecases, 'shareCampaignResult');
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
          id: '5'
        },
        headers: {
          authorization: 'token'
        },
      };
      usecases.shareCampaignResult.resolves();

      // when
      const promise = campaignParticipationController.shareCampaignResult(request, replyStub);

      // then
      return promise.then(() => {
        expect(usecases.shareCampaignResult).to.have.been.calledOnce;
        const updateCampaignParticiaption = usecases.shareCampaignResult.firstCall.args[0];
        expect(updateCampaignParticiaption).to.have.property('campaignParticipationId');
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
            detail: 'campaignParticipationId manquant',
            code: '400',
            title: 'Bad Request',
          }]
        });
      });

      it('should return a 404 status code if the participation is not found', () => {
        // given
        const nonExistingAssessmentId = 1789;
        const request = {
          params: {
            id: nonExistingAssessmentId,
          },
          headers: {
            authorization: 'token'
          },
        };
        usecases.shareCampaignResult.rejects(new NotFoundError());

        // when
        const promise = campaignParticipationController.shareCampaignResult(request, replyStub);

        // then
        return promise.then(() => {
          expect(codeStub).to.have.been.calledWith(404);
          expect(replyStub).to.have.been.calledWith({
            errors: [{
              detail: 'Participation non trouvée',
              code: '404',
              title: 'Not Found',
            }]
          });
        });
      });
    });

    context('when the request comes from a different user', () => {

      it('should return a 403 status code', () => {
        // given
        const request = {
          params: {
            id: '5'
          },
          headers: {
            authorization: 'token'
          },
        };
        usecases.shareCampaignResult.resolves();

        // when
        const promise = campaignParticipationController.shareCampaignResult(request, replyStub);

        // then
        return promise.then(() => {
          expect(usecases.shareCampaignResult).to.have.been.calledOnce;
          const updateCampaignParticiaption = usecases.shareCampaignResult.firstCall.args[0];
          expect(updateCampaignParticiaption).to.have.property('campaignParticipationId');
          expect(updateCampaignParticiaption).to.have.property('userId');
          expect(updateCampaignParticiaption).to.have.property('campaignParticipationRepository');
        });
      });
    });
  });

  describe('#save', () => {

    let sandbox;
    let replyStub;
    let codeStub;
    let request;
    const campaignId = 123456;
    const participantExternalId = 'azer@ty.com';
    const userId = 6;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      sandbox.stub(usecases, 'startCampaignParticipation');
      codeStub = sandbox.stub(serializer, 'serialize').resolves();
      replyStub = sandbox.stub().returns({
        code: codeStub
      });
      request = {
        headers: { authorization: 'token' },
        auth: { credentials: { userId } },
        payload: {
          data: {
            type: 'campaign-participations',
            attributes: {
              'participant-external-id': participantExternalId,
            },
            relationships: {
              'campaign': {
                data: {
                  id: campaignId,
                  type: 'campaigns',
                }
              }
            }
          }
        }
      };
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should call the usecases to start the campaign participation', () => {
      // given
      usecases.startCampaignParticipation.resolves();

      // when
      const promise = campaignParticipationController.save(request, replyStub);

      // then
      return promise.then(() => {
        expect(usecases.startCampaignParticipation).to.have.been.calledOnce;

        const arguments = usecases.startCampaignParticipation.firstCall.args[0];

        expect(arguments.userId).to.equal(userId);

        const campaignParticipation = arguments.campaignParticipation;
        expect(campaignParticipation).to.have.property('campaignId', campaignId);
        expect(campaignParticipation).to.have.property('participantExternalId', participantExternalId);
      });
    });

    it('should return the serialized campaign participation when it has been successfully created', () => {
      // given
      const createdCampaignParticipation = factory.buildCampaignParticipation();
      usecases.startCampaignParticipation.resolves(createdCampaignParticipation);

      const serializedCampaignParticipation = { id: 88, assessmentId: 12 };
      serializer.serialize.returns(serializedCampaignParticipation);

      // when
      const promise = campaignParticipationController.save(request, replyStub);

      // then
      return promise.then(() => {
        expect(serializer.serialize).to.have.been.calledWith(createdCampaignParticipation);
        expect(codeStub).to.have.been.calledWith(201);
        expect(replyStub).to.have.been.calledWith(serializedCampaignParticipation);
      });
    });

  });

});
