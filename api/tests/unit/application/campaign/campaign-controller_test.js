const { sinon, expect, domainBuilder } = require('../../../test-helper');

const campaignController = require('../../../../lib/application/campaigns/campaign-controller');
const campaignSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign-serializer');
const tokenService = require('../../../../lib/domain/services/token-service');
const usecases = require('../../../../lib/domain/usecases');
const { UserNotAuthorizedToCreateCampaignError,
  UserNotAuthorizedToUpdateCampaignError,
  UserNotAuthorizedToGetCampaignResultsError,
  EntityValidationError,
  NotFoundError
} = require('../../../../lib/domain/errors');

describe('Unit | Application | Controller | Campaign', () => {

  let sandbox;
  let replyStub;
  let codeStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    codeStub = sandbox.stub();
    replyStub = sandbox.stub().returns({
      code: codeStub,
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('#save', () => {

    const deserializedCampaign = domainBuilder.buildCampaign({ id: NaN, code: '' });

    beforeEach(() => {
      sandbox.stub(usecases, 'createCampaign');
      sandbox.stub(campaignSerializer, 'deserialize').resolves(deserializedCampaign);
      sandbox.stub(campaignSerializer, 'serialize');
    });

    it('should call the use case to create the new campaign', () => {
      // given
      const connectedUserId = 1;
      const request = { auth: { credentials: { userId: connectedUserId } } };

      const createdCampaign = domainBuilder.buildCampaign();
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
      });
    });

    it('should return a serialized campaign when the campaign has been successfully created', () => {
      // given
      const userId = 1245;
      const request = { auth: { credentials: { userId } } };

      const createdCampaign = domainBuilder.buildCampaign();
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

  describe('#findByCode ', () => {

    const campaignCode = 'AZERTY123';
    let request;

    beforeEach(() => {
      request = {
        query: { 'filter[code]': campaignCode }
      };
      sandbox.stub(usecases, 'getCampaignByCode');
      sandbox.stub(campaignSerializer, 'serialize');
    });

    it('should call the use case to retrieve the campaign with the expected code', () => {
      // given
      const createdCampaign = domainBuilder.buildCampaign();
      usecases.getCampaignByCode.resolves(createdCampaign);

      const serializedCampaign = { name: createdCampaign.name };
      campaignSerializer.serialize.returns(serializedCampaign);

      // when
      const promise = campaignController.getByCode(request, replyStub);

      // then
      return promise.then(() => {
        expect(usecases.getCampaignByCode).to.have.been.calledWith({ code: campaignCode });
      });
    });

    it('should return the serialized campaign found by the use case', () => {
      // given
      const createdCampaign = domainBuilder.buildCampaign();
      usecases.getCampaignByCode.resolves(createdCampaign);

      const serializedCampaign = { name: createdCampaign.name };
      campaignSerializer.serialize.returns(serializedCampaign);

      // when
      const promise = campaignController.getByCode(request, replyStub);

      // then
      return promise.then(() => {
        expect(campaignSerializer.serialize).to.have.been.calledWith([createdCampaign]);
        expect(replyStub).to.have.been.calledWith(serializedCampaign);
        expect(codeStub).to.have.been.calledWith(200);
      });
    });

    it('should return a 404 error if campaign is not found', () => {
      // given
      usecases.getCampaignByCode.rejects(new NotFoundError());

      // when
      const promise = campaignController.getByCode(request, replyStub);

      // then
      return promise.then(() => {
        expect(codeStub).to.have.been.calledWith(404);
      });
    });

    it('should return a 400 error if there is no code param in the request', () => {
      // given
      request.query = {};

      // when
      const promise = campaignController.getByCode(request, replyStub);

      // then
      return promise.then(() => {
        expect(codeStub).to.have.been.calledWith(400);
      });
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
        }
      };

      sandbox.stub(usecases, 'getCampaign');
      sandbox.stub(campaignSerializer, 'serialize');
    });

    it('should returns the campaign', () => {
      // given
      usecases.getCampaign.withArgs({ campaignId: campaign.id }).resolves(campaign);
      campaignSerializer.serialize.withArgs(campaign).returns(campaign);

      // when
      const promise = campaignController.getById(request, replyStub);

      // then
      return promise.then(() => {
        expect(replyStub).to.have.been.calledWithExactly(campaign);
        expect(codeStub).to.have.been.calledWithExactly(200);
      });
    });

    it('should throw an error when the campaign could not be retrieved', () => {
      // given
      usecases.getCampaign.withArgs({ campaignId: campaign.id }).rejects();

      // when
      const promise = campaignController.getById(request, replyStub);

      // then
      return promise.then(() => {
        expect(codeStub).to.have.been.calledWithExactly(500);
      });
    });

    it('should throw an infra NotFoundError when a NotFoundError is catched', () => {
      // given
      usecases.getCampaign.withArgs({ campaignId: campaign.id }).rejects(new NotFoundError());

      // when
      const promise = campaignController.getById(request, replyStub);

      // then
      return promise.then(() => {
        expect(codeStub).to.have.been.calledWithExactly(404);
      });
    });

  });

  describe('#update ', () => {
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

      sandbox.stub(usecases, 'updateCampaign');
      sandbox.stub(campaignSerializer, 'serialize');
    });

    it('should returns the updated campaign', () => {
      // given
      usecases.updateCampaign.withArgs(updateCampaignArgs).resolves(updatedCampaign);
      campaignSerializer.serialize.withArgs(updatedCampaign).returns(updatedCampaign);

      // when
      const promise = campaignController.update(request, replyStub);

      // then
      return promise.then(() => {
        expect(replyStub).to.have.been.calledWithExactly(updatedCampaign);
        expect(codeStub).to.have.been.calledWithExactly(200);
      });
    });

    it('should throw an error when the campaign could not be updated', () => {
      // given
      usecases.updateCampaign.withArgs(updateCampaignArgs).rejects();

      // when
      const promise = campaignController.update(request, replyStub);

      // then
      return promise.then(() => {
        expect(codeStub).to.have.been.calledWithExactly(500);
      });
    });

    it('should throw an infra NotFoundError when a NotFoundError is catched', () => {
      // given
      usecases.updateCampaign.withArgs(updateCampaignArgs).rejects(new NotFoundError());

      // when
      const promise = campaignController.update(request, replyStub);

      // then
      return promise.then(() => {
        expect(codeStub).to.have.been.calledWithExactly(404);
      });
    });

    it('should throw a forbiddenError when user is not authorized to update the campaign', () => {
      // given
      usecases.updateCampaign.withArgs(updateCampaignArgs).rejects(new UserNotAuthorizedToUpdateCampaignError());

      // when
      const promise = campaignController.update(request, replyStub);

      // then
      return promise.then(() => {
        expect(codeStub).to.have.been.calledWithExactly(403);
      });
    });

  });

});
