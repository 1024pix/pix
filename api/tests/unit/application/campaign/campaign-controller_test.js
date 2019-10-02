const { sinon, expect, domainBuilder, hFake, catchErr } = require('../../../test-helper');

const campaignController = require('../../../../lib/application/campaigns/campaign-controller');

const campaignSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign-serializer');
const campaignReportSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign-report-serializer');
const campaignCollectiveResultSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign-collective-result-serializer');

const tokenService = require('../../../../lib/domain/services/token-service');
const usecases = require('../../../../lib/domain/usecases');
const { UserNotAuthorizedToAccessEntity } = require('../../../../lib/domain/errors');
const queryParamsUtils = require('../../../../lib/infrastructure/utils/query-params-utils');
const requestUtils = require('../../../../lib/infrastructure/utils/request-utils');

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
  });

  describe('#getByCode ', () => {

    let request;
    const campaignCode = 'AZERTY123';
    const userId = 1;

    beforeEach(() => {
      request = {
        query: { 'filter[code]': campaignCode }
      };
      sinon.stub(requestUtils, 'extractUserIdFromRequest').returns(userId);
      sinon.stub(usecases, 'retrieveCampaignInformation');
      sinon.stub(usecases, 'addOrganizationLogoToCampaign');
      sinon.stub(usecases, 'assertUserBelongToOrganization');
      sinon.stub(campaignSerializer, 'serialize');
    });

    it('should call retrieveCampaignInformation usecase to retrieve the campaign by code', async () => {
      // given
      const createdCampaign = domainBuilder.buildCampaign();
      usecases.retrieveCampaignInformation.resolves(createdCampaign);

      const serializedCampaign = { name: createdCampaign.name };
      campaignSerializer.serialize.returns(serializedCampaign);

      // when
      await campaignController.getByCode(request, hFake);

      // then
      expect(usecases.retrieveCampaignInformation).to.have.been.calledWith({ code: campaignCode });
    });

    it('should call addOrganizationLogoToCampaign usecase', async () => {
      // given
      const createdCampaign = domainBuilder.buildCampaign();
      usecases.retrieveCampaignInformation.resolves(createdCampaign);
      usecases.addOrganizationLogoToCampaign.resolves(createdCampaign);

      // when
      await campaignController.getByCode(request, hFake);

      // then
      expect(usecases.addOrganizationLogoToCampaign).to.have.been.calledWith({ campaign: createdCampaign });
    });

    it('should call assertUserBelongToOrganization usecase', async () => {
      // given
      const createdCampaign = domainBuilder.buildCampaign();
      usecases.retrieveCampaignInformation.resolves(createdCampaign);
      usecases.addOrganizationLogoToCampaign.resolves(createdCampaign);
      usecases.assertUserBelongToOrganization.resolves();

      // when
      await campaignController.getByCode(request, hFake);

      // then
      expect(usecases.assertUserBelongToOrganization).to.have.been.calledWith({ userId, campaign: createdCampaign });
    });

    it('should return the serialized campaign found by the use case', async () => {
      // given
      const createdCampaign = domainBuilder.buildCampaign();
      usecases.retrieveCampaignInformation.resolves(createdCampaign);

      const organizationLogoUrl = 'url for the orga logo';
      const augmentedCampaign = Object.assign({}, createdCampaign, organizationLogoUrl);
      usecases.addOrganizationLogoToCampaign.resolves(augmentedCampaign);

      const serializedCampaign = { name: augmentedCampaign.name };
      campaignSerializer.serialize.returns(serializedCampaign);

      // when
      const response = await campaignController.getByCode(request, hFake);

      // then
      expect(campaignSerializer.serialize).to.have.been.calledWith([augmentedCampaign]);
      expect(response).to.deep.equal(serializedCampaign);
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

    it('should return the campaign', async () => {
      // given
      const tokenForCampaignResults = 'token';
      const expectedCampaign = { ...campaign, tokenForCampaignResults };
      usecases.getCampaign.withArgs({ campaignId: campaign.id, options: {} }).resolves(campaign);
      campaignSerializer.serialize.withArgs(campaign, { tokenForCampaignResults }).returns(expectedCampaign);

      // when
      const response = await campaignController.getById(request, hFake);

      // then
      expect(response).to.deep.equal(expectedCampaign);
    });
  });

  describe('#update', () => {
    let request, updatedCampaign, updateCampaignArgs;

    beforeEach(() => {
      request = {
        auth: { credentials: { userId: 1 } },
        params: { id: 1 },
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

    it('should return the updated campaign', async () => {
      // given
      usecases.updateCampaign.withArgs(updateCampaignArgs).resolves(updatedCampaign);
      campaignSerializer.serialize.withArgs(updatedCampaign).returns(updatedCampaign);

      // when
      const response = await campaignController.update(request, hFake);

      // then
      expect(response).to.deep.equal(updatedCampaign);
    });
  });

  describe('#getReport', () => {

    const campaignId = 1;

    beforeEach(() => {
      sinon.stub(usecases, 'getCampaignReport');
      sinon.stub(campaignReportSerializer, 'serialize');
    });

    it('should return ok', async () => {
      // given
      usecases.getCampaignReport.withArgs({ campaignId }).resolves({});
      campaignReportSerializer.serialize.withArgs({}).returns('ok');

      // when
      const response = await campaignController.getReport({ params: { id: campaignId } });

      // then
      expect(response).to.be.equal('ok');
    });

  });

  describe('#getCollectiveResult', () => {

    const campaignId = 1;
    const userId = 1;

    beforeEach(() => {
      sinon.stub(usecases, 'computeCampaignCollectiveResult');
      sinon.stub(campaignCollectiveResultSerializer, 'serialize');
    });

    it('should return ok', async () => {
      // given
      usecases.computeCampaignCollectiveResult.resolves({});
      campaignCollectiveResultSerializer.serialize.withArgs({}).returns('ok');

      // when
      const response = await campaignController.getCollectiveResult({
        params: { id: campaignId },
        auth: {
          credentials: { userId }
        }
      });

      // then
      expect(response).to.be.equal('ok');
    });

    it('should return an unauthorized error', async () => {
      // given
      const error = new UserNotAuthorizedToAccessEntity('User does not have access to this campaign participation');
      const request = {
        params: { id: campaignId },
        auth: {
          credentials: { userId }
        }
      };
      usecases.computeCampaignCollectiveResult.rejects(error);

      // when
      const errorCatched = await catchErr(campaignController.getCollectiveResult)(request);

      // then
      expect(errorCatched).to.be.instanceof(UserNotAuthorizedToAccessEntity);
    });

  });
});
