const { sinon, expect, factory } = require('../../../test-helper');

const campaignController = require('../../../../lib/application/campaigns/campaign-controller');
const usecases = require('../../../../lib/domain/usecases');
const campaignRepository = require('../../../../lib/infrastructure/repositories/campaign-repository');
const userRepository = require('../../../../lib/infrastructure/repositories/user-repository');
const campaignSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign-serializer');
const { UserNotAuthorizedToCreateCampaignError, EntityValidationError } = require('../../../../lib/domain/errors');

describe('Unit | Application | Controller | Campaign', () => {

  describe('#save', () => {

    let replyStub;
    let codeStub;

    beforeEach(() => {
      sinon.stub(usecases, 'createCampaign');
      sinon.stub(campaignSerializer, 'deserialize');
      sinon.stub(campaignSerializer, 'serialize');
      codeStub = sinon.stub();
      replyStub = sinon.stub().returns({
        code: codeStub,
      });
    });

    afterEach(() => {
      usecases.createCampaign.restore();
      campaignSerializer.deserialize.restore();
      campaignSerializer.serialize.restore();
    });

    it('should call the use case to create the new campaign', () => {
      // given
      const userId = 1245;
      const request = { auth: { credentials: { userId } } };

      const deserializedCampaign = factory.buildCampaign({ id: NaN, code: '', creatorId: '' });
      campaignSerializer.deserialize.returns(deserializedCampaign);

      const createdCampaign = factory.buildCampaign();
      usecases.createCampaign.resolves(createdCampaign);

      // when
      const promise = campaignController.save(request, replyStub);

      // then
      return promise.then(() => {
        const createCampaignArgs = usecases.createCampaign.firstCall.args[0];
        expect(createCampaignArgs.campaign).to.have.property('name', deserializedCampaign.name);
        expect(createCampaignArgs.campaign).to.have.property('creatorId', userId);
        expect(createCampaignArgs.campaign).to.have.property('organizationId', deserializedCampaign.organizationId);
        expect(createCampaignArgs).to.have.property('campaignRepository', campaignRepository);
        expect(createCampaignArgs).to.have.property('userRepository', userRepository);
      });
    });

    it('should return a serialized campaign when the campaign has been successfully created', () => {
      // given
      const userId = 1245;
      const request = { auth: { credentials: { userId } } };

      const deserializedCampaign = factory.buildCampaign({ id: NaN, code: '', creatorId: '' });
      campaignSerializer.deserialize.returns(deserializedCampaign);

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

});
