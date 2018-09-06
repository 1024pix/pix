const { sinon, expect, factory } = require('../../../test-helper');

const campaignController = require('../../../../lib/application/campaigns/campaign-controller');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const campaignSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign-serializer');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const { NotFoundError } = require('../../../../lib/domain/errors');
const tokenService = require('../../../../lib/domain/services/token-service');
const usecases = require('../../../../lib/domain/usecases');
const { UserNotAuthorizedToCreateCampaignError, UserNotAuthorizedToGetCampaignResultsError, EntityValidationError } = require('../../../../lib/domain/errors');

describe('Unit | Application | Controller | Campaign', () => {

  describe('#save', () => {

    let sandbox;
    let replyStub;
    let codeStub;
    const deserializedCampaign = factory.buildCampaign({ id: NaN, code: '' });

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      sandbox.stub(usecases, 'createCampaign');
      sandbox.stub(campaignSerializer, 'deserialize').resolves(deserializedCampaign);
      sandbox.stub(campaignSerializer, 'serialize');
      codeStub = sandbox.stub();
      replyStub = sandbox.stub().returns({
        code: codeStub,
      });
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should call the use case to create the new campaign', () => {
      // given
      const connectedUserId = 1;
      const request = { auth: { credentials: { userId: connectedUserId } } };

      const createdCampaign = factory.buildCampaign();
      usecases.createCampaign.resolves(createdCampaign);

      // when
      const promise = campaignController.save(request, replyStub);

      // then
      return promise.then(() => {
        expect(usecases.createCampaign).to.have.been.calledOnce;
        const createCampaignArgs = usecases.createCampaign.firstCall.args[0];
        expect(createCampaignArgs.campaign).to.have.property('name', deserializedCampaign.name);
        expect(createCampaignArgs.campaign).to.have.property('creatorId', connectedUserId);
        expect(createCampaignArgs.campaign).to.have.property('organizationId', deserializedCampaign.organizationId);
        expect(createCampaignArgs).to.have.property('campaignRepository', campaignRepository);
        expect(createCampaignArgs).to.have.property('userRepository', userRepository);
      });
    });

    it('should return a serialized campaign when the campaign has been successfully created', () => {
      // given
      const userId = 1245;
      const request = { auth: { credentials: { userId } } };

      const createdCampaign = factory.buildCampaign();
      usecases.createCampaign.resolves(createdCampaign);

      const serializedCampaign = { name: createdCampaign.name };
      campaignSerializer.serialize.returns(serializedCampaign);

      // when
      const promise = campaignController.save(request, replyStub);

      // then
      return promise.then(() => {
        expect(campaignSerializer.serialize).to.have.been.calledWith(createdCampaign);
        expect(replyStub).to.have.been.calledWith(serializedCampaign);
        expect(codeStub).to.have.been.calledWith(201);
      });
    });

    it('should throw a 403 JSONAPI error if user is not authorized to create a campaign', () => {
      // given
      const request = { auth: { credentials: { userId: 51423 } } };
      const errorMessage = 'User is not authorized to create campaign';
      usecases.createCampaign.rejects(new UserNotAuthorizedToCreateCampaignError(errorMessage));

      const expectedUnprocessableEntityError = {
        errors: [{
          detail: errorMessage,
          status: '403',
          title: 'Forbidden Error'
        }]
      };

      // when
      const promise = campaignController.save(request, replyStub);

      // then
      return promise.then(() => {
        expect(codeStub).to.have.been.calledWith(403);
        expect(replyStub).to.have.been.calledWith(expectedUnprocessableEntityError);

      });
    });

    it('should throw a 422 JSONAPI error if user there is a validation error on the campaign', () => {
      // given
      const request = { auth: { credentials: { userId: 51423 } } };
      const expectedValidationError = new EntityValidationError({
        invalidAttributes: [
          {
            attribute: 'name',
            message: 'Le nom n’est pas renseigné.',
          },
          {
            attribute: 'organizationId',
            message: 'L’id de l’organisation n’est pas renseigné.',
          },
        ]
      });
      usecases.createCampaign.rejects(expectedValidationError);

      const jsonApiValidationErrors = {
        errors: [
          {
            status: '422',
            source: { 'pointer': '/data/attributes/name' },
            title: 'Invalid data attribute "name"',
            detail: 'Le nom n’est pas renseigné.'
          },
          {
            status: '422',
            source: { 'pointer': '/data/relationships/organization' },
            title: 'Invalid relationship "organization"',
            detail: 'L’id de l’organisation n’est pas renseigné.'
          }
        ]
      };

      // when
      const promise = campaignController.save(request, replyStub);

      // then
      return promise.then(() => {
        expect(codeStub).to.have.been.calledWith(422);
        expect(replyStub).to.have.been.calledWith(jsonApiValidationErrors);

      });
    });

    it('should throw a 500 JSONAPI error if an unknown error occurs', () => {
      // given
      const request = { auth: { credentials: { userId: 51423 } } };
      usecases.createCampaign.rejects(new Error());

      const expectedInternalServerError = {
        errors: [{
          detail: 'Une erreur inattendue est survenue lors de la création de la campagne',
          status: '500',
          title: 'Internal Server Error'
        }]
      };

      // when
      const promise = campaignController.save(request, replyStub);

      // then
      return promise.then(() => {
        expect(codeStub).to.have.been.calledWith(500);
        expect(replyStub).to.have.been.calledWith(expectedInternalServerError);
      });
    });

  });

  describe('#getCsvResult', () => {
    let sandbox;
    let replyStub;
    let codeStub;
    const userId = 1;

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      sandbox.stub(usecases, 'getResultsCampaignInCSVFormat');
      sandbox.stub(tokenService, 'extractUserIdForCampaignResults').resolves(userId);
      codeStub = sandbox.stub();
      replyStub = sandbox.stub().returns({
        code: codeStub,
        header: sandbox.stub().returns({
          header: sandbox.stub()
        }),
      });
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should call the use case to get result campaign in csv', () => {
      // given
      const campaignId = 2;
      const request = {
        query: {
          accessToken: 'token'
        },
        params: {
          id: campaignId
        }
      };
      usecases.getResultsCampaignInCSVFormat.resolves('csv;result');

      // when
      const promise = campaignController.getCsvResults(request, replyStub);

      // then
      return promise.then(() => {
        expect(usecases.getResultsCampaignInCSVFormat).to.have.been.calledOnce;
        const getResultsCampaignArgs = usecases.getResultsCampaignInCSVFormat.firstCall.args[0];
        expect(getResultsCampaignArgs).to.have.property('userId');
        expect(getResultsCampaignArgs).to.have.property('campaignId');
      });
    });

    it('should return a serialized campaign when the campaign has been successfully created', () => {
      // given
      const campaignId = 2;
      const request = {
        query: {
          accessToken: 'token'
        },
        params: {
          id: campaignId
        }
      };
      usecases.getResultsCampaignInCSVFormat.resolves({ csvData: 'csv;result', campaignName: 'Campagne' });

      // when
      const promise = campaignController.getCsvResults(request, replyStub);

      // then
      return promise.then(() => {
        expect(replyStub).to.have.been.calledWith('csv;result');
      });
    });

    it('should throw a 403 JSONAPI error if user is not authorized to create a campaign', () => {
      // given
      const campaignId = 2;
      const request = {
        query: {
          accessToken: 'token'
        },
        params: {
          id: campaignId
        }
      };
      const errorMessage = 'Vous ne pouvez pas accéder à cette campagne';
      usecases.getResultsCampaignInCSVFormat.rejects(new UserNotAuthorizedToGetCampaignResultsError(errorMessage));

      const expectedUnprocessableEntityError = {
        errors: [{
          detail: errorMessage,
          status: '403',
          title: 'Forbidden Error'
        }]
      };

      // when
      const promise = campaignController.getCsvResults(request, replyStub);

      // then
      return promise.then(() => {
        expect(codeStub).to.have.been.calledWith(403);
        expect(replyStub).to.have.been.calledWith(expectedUnprocessableEntityError);

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
      const promise = campaignController.shareCampaignResult(request, replyStub);

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
        campaignController.shareCampaignResult(request, replyStub);

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
        const promise = campaignController.shareCampaignResult(request, replyStub);

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
        const promise = campaignController.shareCampaignResult(request, replyStub);

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
