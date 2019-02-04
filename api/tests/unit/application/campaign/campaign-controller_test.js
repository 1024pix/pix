const { sinon, expect, domainBuilder, hFake } = require('../../../test-helper');

const campaignController = require('../../../../lib/application/campaigns/campaign-controller');
const campaignSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign-serializer');
const tokenService = require('../../../../lib/domain/services/token-service');
const usecases = require('../../../../lib/domain/usecases');
const queryParamsUtils = require('../../../../lib/infrastructure/utils/query-params-utils');
const { UserNotAuthorizedToCreateCampaignError,
  UserNotAuthorizedToUpdateRessourceError,
  UserNotAuthorizedToGetCampaignResultsError,
  EntityValidationError,
  NotFoundError
} = require('../../../../lib/domain/errors');

describe('Unit | Application | Controller | Campaign', () => {

  describe('#save', () => {

    const deserializedCampaign = domainBuilder.buildCampaign({ id: NaN, code: '' });

    beforeEach(() => {
      sinon.stub(usecases, 'createCampaign');
      sinon.stub(campaignSerializer, 'deserialize').resolves(deserializedCampaign);
      sinon.stub(campaignSerializer, 'serialize');
    });

    it('should call the use case to create the new campaign', async () => {
      // given
      const connectedUserId = 1;
      const request = { auth: { credentials: { userId: connectedUserId } } };

      const createdCampaign = domainBuilder.buildCampaign();
      usecases.createCampaign.resolves(createdCampaign);

      // when
      await campaignController.save(request, hFake);

      // then
      expect(usecases.createCampaign).to.have.been.calledOnce;
      const createCampaignArgs = usecases.createCampaign.firstCall.args[0];
      expect(createCampaignArgs.campaign).to.have.property('name', deserializedCampaign.name);
      expect(createCampaignArgs.campaign).to.have.property('creatorId', connectedUserId);
      expect(createCampaignArgs.campaign).to.have.property('organizationId', deserializedCampaign.organizationId);
    });

    it('should return a serialized campaign when the campaign has been successfully created', async () => {
      // given
      const userId = 1245;
      const request = { auth: { credentials: { userId } } };

      const createdCampaign = domainBuilder.buildCampaign();
      usecases.createCampaign.resolves(createdCampaign);

      const serializedCampaign = { name: createdCampaign.name };
      campaignSerializer.serialize.returns(serializedCampaign);

      // when
      const response = await campaignController.save(request, hFake);

      // then
      expect(campaignSerializer.serialize).to.have.been.calledWith(createdCampaign);
      expect(response.source).to.deep.equal(serializedCampaign);
      expect(response.statusCode).to.equal(201);
    });

    it('should throw a 403 JSONAPI error if user is not authorized to create a campaign', async () => {
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
      const response = await campaignController.save(request, hFake);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.source).to.deep.equal(expectedUnprocessableEntityError);
    });

    it('should throw a 422 JSONAPI error if user there is a validation error on the campaign', async () => {
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
      const response = await campaignController.save(request, hFake);

      // then
      expect(response.statusCode).to.equal(422);
      expect(response.source).to.deep.equal(jsonApiValidationErrors);
    });

    it('should throw a 500 JSONAPI error if an unknown error occurs', async () => {
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
      const response = await campaignController.save(request, hFake);

      // then
      expect(response.statusCode).to.equal(500);
      expect(response.source).to.deep.equal(expectedInternalServerError);
    });

  });

  describe('#getCsvResult', () => {
    const userId = 1;

    beforeEach(() => {
      sinon.stub(usecases, 'getResultsCampaignInCSVFormat');
      sinon.stub(tokenService, 'extractUserIdForCampaignResults').resolves(userId);
    });

    it('should call the use case to get result campaign in csv', async () => {
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
      await campaignController.getCsvResults(request, hFake);

      // then
      expect(usecases.getResultsCampaignInCSVFormat).to.have.been.calledOnce;
      const getResultsCampaignArgs = usecases.getResultsCampaignInCSVFormat.firstCall.args[0];
      expect(getResultsCampaignArgs).to.have.property('userId');
      expect(getResultsCampaignArgs).to.have.property('campaignId');
    });

    it('should return a serialized campaign when the campaign has been successfully created', async () => {
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
      const response = await campaignController.getCsvResults(request, hFake);

      // then
      expect(response.source).to.deep.equal('csv;result');
    });

    it('should throw a 403 JSONAPI error if user is not authorized to create a campaign', async () => {
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
      const response = await campaignController.getCsvResults(request, hFake);

      // then
      expect(response.statusCode).to.equal(403);
      expect(response.source).to.deep.equal(expectedUnprocessableEntityError);
    });
  });

  describe('#findByCode ', () => {

    const campaignCode = 'AZERTY123';
    let request;

    beforeEach(() => {
      request = {
        query: { 'filter[code]': campaignCode }
      };
      sinon.stub(usecases, 'getCampaignByCode');
      sinon.stub(campaignSerializer, 'serialize');
    });

    it('should call the use case to retrieve the campaign with the expected code', async () => {
      // given
      const createdCampaign = domainBuilder.buildCampaign();
      usecases.getCampaignByCode.resolves(createdCampaign);

      const serializedCampaign = { name: createdCampaign.name };
      campaignSerializer.serialize.returns(serializedCampaign);

      // when
      await campaignController.getByCode(request, hFake);

      // then
      expect(usecases.getCampaignByCode).to.have.been.calledWith({ code: campaignCode });
    });

    it('should return the serialized campaign found by the use case', async () => {
      // given
      const createdCampaign = domainBuilder.buildCampaign();
      usecases.getCampaignByCode.resolves(createdCampaign);

      const serializedCampaign = { name: createdCampaign.name };
      campaignSerializer.serialize.returns(serializedCampaign);

      // when
      const response = await campaignController.getByCode(request, hFake);

      // then
      expect(campaignSerializer.serialize).to.have.been.calledWith([createdCampaign]);
      expect(response.source).to.deep.equal(serializedCampaign);
      expect(response.statusCode).to.equal(200);
    });

    it('should return a 404 error if campaign is not found', async () => {
      // given
      usecases.getCampaignByCode.rejects(new NotFoundError());

      // when
      const response = await campaignController.getByCode(request, hFake);

      // then
      expect(response.statusCode).to.equal(404);
    });

    it('should return a 400 error if there is no code param in the request', async () => {
      // given
      request.query = {};

      // when
      const response = await campaignController.getByCode(request, hFake);

      // then
      expect(response.statusCode).to.equal(400);
    });

  });

  describe('#getById ', () => {
    let request, campaign;

    beforeEach(() => {
      campaign = {
        id: 1,
        name: 'My campaign',
      };
      request = {
        params: {
          id: campaign.id
        },
        auth: {
          credentials: {
            userId: 1
          }
        },
        query: {}
      };

      sinon.stub(usecases, 'getCampaign');
      sinon.stub(campaignSerializer, 'serialize');
      sinon.stub(queryParamsUtils, 'extractParameters');
      sinon.stub(tokenService, 'createTokenForCampaignResults');

      queryParamsUtils.extractParameters.withArgs({}).returns({});
      tokenService.createTokenForCampaignResults.withArgs(request.auth.credentials.userId).returns('token');
    });

    it('should returns the campaign', async () => {
      // given
      const expectedCampaign = { ...campaign, tokenForCampaignResults: 'token' };
      usecases.getCampaign.withArgs({ campaignId: campaign.id, options: {} }).resolves(campaign);
      campaignSerializer.serialize.withArgs(campaign, 'token').returns(expectedCampaign);

      // when
      const response = await campaignController.getById(request, hFake);

      // then
      expect(response.source).to.deep.equal(expectedCampaign);
      expect(response.statusCode).to.equal(200);
    });

    it('should throw an error when the campaign could not be retrieved', async () => {
      // given
      usecases.getCampaign.withArgs({ campaignId: campaign.id, options: {} }).rejects();

      // when
      const response = await campaignController.getById(request, hFake);

      // then
      expect(response.statusCode).to.equal(500);
    });

    it('should throw an infra NotFoundError when a NotFoundError is catched', async () => {
      // given
      usecases.getCampaign.withArgs({ campaignId: campaign.id, options: {} }).rejects(new NotFoundError());

      // when
      const response = await campaignController.getById(request, hFake);

      // then
      expect(response.statusCode).to.equal(404);
    });

  });

  describe('#update', () => {
    let request, updatedCampaign, updateCampaignArgs;

    beforeEach(() => {
      request = {
        auth: { credentials: { userId: 1 } },
        params: { id : 1 },
        payload: {
          data: {
            attributes: {
              title: 'New title',
              'custom-landing-page-text': 'New text',
            }
          }
        }
      };

      updatedCampaign = {
        id: request.params.id,
        title: request.payload.data.attributes.title,
        customLandingPageText: request.payload.data.attributes['custom-landing-page-text'],
      };

      updateCampaignArgs = {
        userId: request.auth.credentials.userId,
        campaignId: updatedCampaign.id,
        title: updatedCampaign.title,
        customLandingPageText: updatedCampaign.customLandingPageText,
      };

      sinon.stub(usecases, 'updateCampaign');
      sinon.stub(campaignSerializer, 'serialize');
    });

    it('should returns the updated campaign', async () => {
      // given
      usecases.updateCampaign.withArgs(updateCampaignArgs).resolves(updatedCampaign);
      campaignSerializer.serialize.withArgs(updatedCampaign).returns(updatedCampaign);

      // when
      const response = await campaignController.update(request, hFake);

      // then
      expect(response.source).to.deep.equal(updatedCampaign);
      expect(response.statusCode).to.equal(200);
    });

    it('should throw an error when the campaign could not be updated', async () => {
      // given
      usecases.updateCampaign.withArgs(updateCampaignArgs).rejects();

      // when
      const response = await campaignController.update(request, hFake);

      // then
      expect(response.statusCode).to.equal(500);
    });

    it('should throw an infra NotFoundError when a NotFoundError is catched', async () => {
      // given
      usecases.updateCampaign.withArgs(updateCampaignArgs).rejects(new NotFoundError());

      // when
      const response = await campaignController.update(request, hFake);

      // then
      expect(response.statusCode).to.equal(404);
    });

    it('should throw a forbiddenError when user is not authorized to update the campaign', async () => {
      // given
      usecases.updateCampaign.withArgs(updateCampaignArgs).rejects(new UserNotAuthorizedToUpdateRessourceError());

      // when
      const response = await campaignController.update(request, hFake);

      // then
      expect(response.statusCode).to.equal(403);
    });

  });
});
