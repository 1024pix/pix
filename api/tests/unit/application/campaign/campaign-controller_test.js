const { sinon, expect, factory } = require('../../../test-helper');

const campaignController = require('../../../../lib/application/campaigns/campaign-controller');
const usecases = require('../../../../lib/domain/usecases');
const tokenService = require('../../../../lib/domain/services/token-service');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const campaignSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign-serializer');
const { UserNotAuthorizedToCreateCampaignError, EntityValidationError } = require('../../../../lib/domain/errors');

describe('Unit | Application | Controller | Campaign', () => {

  describe('#save', () => {

    let sandbox;
    let replyStub;
    let codeStub;
    const deserializedCampaign = factory.buildCampaign({ id: NaN, code: '' });

    beforeEach(() => {
      sandbox = sinon.createSandbox();
      sandbox.stub(usecases, 'createCampaign');
      sandbox.stub(campaignSerializer, 'deserialize').returns(deserializedCampaign);
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
      const request = { auth: { credentials: { userId : connectedUserId } } };

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
            source: { 'pointer': '/data/attributes/organization-id' },
            title: 'Invalid data attribute "organizationId"',
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
      sandbox.stub(tokenService, 'extractAccessUserId').resolves(userId);
      codeStub = sandbox.stub();
      replyStub = sandbox.stub().returns({
        code: codeStub,
        header: sandbox.stub().returns({
          header:sandbox.stub()
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
      usecases.getResultsCampaignInCSVFormat.rejects(new UserNotAuthorizedToCreateCampaignError(errorMessage));

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

});
