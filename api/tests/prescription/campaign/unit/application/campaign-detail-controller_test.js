import { sinon, expect, hFake, domainBuilder } from '../../../../test-helper.js';
import { campaignDetailController } from '../../../../../src/prescription/campaign/application/campaign-detail-controller.js';
import { usecases } from '../../../../../src/prescription/campaign/domain/usecases/index.js';

describe('Unit | Application | Controller | Campaign detail', function () {
  describe('#getById', function () {
    const campaignId = 1;
    const userId = 1;

    let request, campaign;
    let campaignReportSerializerStub;
    let queryParamsUtilsStub;
    let tokenServiceStub;

    beforeEach(function () {
      campaign = {
        id: 1,
        name: 'My campaign',
      };
      request = {
        params: {
          id: campaign.id,
        },
        auth: {
          credentials: {
            userId: 1,
          },
        },
        query: {},
      };

      sinon.stub(usecases, 'getCampaign');
      campaignReportSerializerStub = {
        serialize: sinon.stub(),
      };
      queryParamsUtilsStub = { extractParameters: sinon.stub() };
      tokenServiceStub = { createTokenForCampaignResults: sinon.stub().returns('token') };
      queryParamsUtilsStub.extractParameters.withArgs({}).returns({});
      usecases.getCampaign.resolves(campaign);
    });

    it('should return the campaign', async function () {
      // given
      const expectedResult = Symbol('ok');
      const tokenForCampaignResults = 'token';
      campaignReportSerializerStub.serialize
        .withArgs(campaign, {}, { tokenForCampaignResults })
        .returns(expectedResult);

      const dependencies = {
        campaignReportSerializer: campaignReportSerializerStub,
        queryParamsUtils: queryParamsUtilsStub,
        tokenService: tokenServiceStub,
      };
      // when
      const response = await campaignDetailController.getById(request, hFake, dependencies);

      // then
      expect(usecases.getCampaign).calledWith({ campaignId, userId });
      expect(tokenServiceStub.createTokenForCampaignResults).to.have.been.calledWithExactly({ userId, campaignId });
      expect(response).to.deep.equal(expectedResult);
    });
  });

  describe('#findPaginatedFilteredCampaigns', function () {
    let organizationId;
    let request;
    let campaign;
    let serializedCampaigns;
    let dependencies;

    beforeEach(function () {
      organizationId = 1;
      request = {
        params: { id: organizationId },
        auth: {
          credentials: {
            userId: 1,
          },
        },
      };
      campaign = domainBuilder.buildCampaign();
      serializedCampaigns = [{ name: campaign.name, code: campaign.code }];

      const queryParamsUtilsStub = {
        extractParameters: sinon.stub(),
      };
      const campaignReportSerializerStub = {
        serialize: sinon.stub(),
      };
      dependencies = {
        queryParamsUtils: queryParamsUtilsStub,
        campaignReportSerializer: campaignReportSerializerStub,
      };
      sinon.stub(usecases, 'findPaginatedFilteredOrganizationCampaigns');
    });

    it('should call the usecase to get the campaigns and associated campaignReports', async function () {
      // given
      request.query = {
        campaignReport: true,
      };
      const expectedPage = 2;
      const expectedFilter = { name: 'Math' };
      dependencies.queryParamsUtils.extractParameters
        .withArgs(request.query)
        .returns({ page: expectedPage, filter: expectedFilter });
      const expectedResults = [campaign];
      const expectedPagination = { page: expectedPage, pageSize: 25, itemsCount: 100, pagesCount: 4 };
      usecases.findPaginatedFilteredOrganizationCampaigns.resolves({
        models: expectedResults,
        pagination: expectedPagination,
      });
      dependencies.campaignReportSerializer.serialize.returns({ data: serializedCampaigns, meta: {} });

      // when
      await campaignDetailController.findPaginatedFilteredCampaigns(request, hFake, dependencies);

      // then
      expect(usecases.findPaginatedFilteredOrganizationCampaigns).to.have.been.calledWithExactly({
        organizationId,
        filter: expectedFilter,
        page: expectedPage,
        userId: request.auth.credentials.userId,
      });
    });

    it('should return the serialized campaigns belonging to the organization', async function () {
      // given
      request.query = {};
      const expectedResponse = { data: serializedCampaigns, meta: {} };
      dependencies.queryParamsUtils.extractParameters.withArgs({}).returns({ filter: {} });
      usecases.findPaginatedFilteredOrganizationCampaigns.resolves({ models: {}, pagination: {} });
      dependencies.campaignReportSerializer.serialize.returns(expectedResponse);

      // when
      const response = await campaignDetailController.findPaginatedFilteredCampaigns(request, hFake, dependencies);

      // then
      expect(response).to.deep.equal(expectedResponse);
    });

    it('should return a JSON API response with meta information', async function () {
      // given
      request.query = {};
      const expectedResults = [campaign];
      const expectedPagination = { page: 2, pageSize: 25, itemsCount: 100, pagesCount: 4, hasCampaigns: true };
      dependencies.queryParamsUtils.extractParameters.withArgs({}).returns({ filter: {} });
      usecases.findPaginatedFilteredOrganizationCampaigns.resolves({
        models: expectedResults,
        meta: expectedPagination,
      });

      // when
      await campaignDetailController.findPaginatedFilteredCampaigns(request, hFake, dependencies);

      // then
      expect(dependencies.campaignReportSerializer.serialize).to.have.been.calledWithExactly(
        expectedResults,
        expectedPagination,
      );
    });
  });

  describe('#getCsvProfilesCollectionResults', function () {
    it('should call the use case to get result campaign in csv', async function () {
      // given
      const campaignId = 2;
      const request = _getRequestForCampaignId(campaignId);

      sinon
        .stub(usecases, 'startWritingCampaignProfilesCollectionResultsToStream')
        .resolves({ fileName: 'any file name' });

      // when
      await campaignDetailController.getCsvProfilesCollectionResults(request, hFake);

      // then
      expect(usecases.startWritingCampaignProfilesCollectionResultsToStream).to.have.been.calledOnce;
      const getResultsCampaignArgs = usecases.startWritingCampaignProfilesCollectionResultsToStream.firstCall.args[0];
      expect(getResultsCampaignArgs).to.have.property('campaignId');
    });

    it('should return a response with correct headers', async function () {
      // given
      const campaignId = 2;
      const request = _getRequestForCampaignId(campaignId);

      sinon
        .stub(usecases, 'startWritingCampaignProfilesCollectionResultsToStream')
        .resolves({ fileName: 'expected file name' });

      // when
      const response = await campaignDetailController.getCsvProfilesCollectionResults(request, hFake);

      // then
      expect(response.headers['content-type']).to.equal('text/csv;charset=utf-8');
      expect(response.headers['content-disposition']).to.equal('attachment; filename="expected file name"');
      expect(response.headers['content-encoding']).to.equal('identity');
    });

    it('should fix invalid header chars in filename', async function () {
      // given
      const campaignId = 2;
      const request = _getRequestForCampaignId(campaignId);

      sinon.stub(usecases, 'startWritingCampaignProfilesCollectionResultsToStream').resolves({
        fileName: 'file-name with invalid_chars •’<>:"/\\|?*"\n.csv',
      });

      // when
      const response = await campaignDetailController.getCsvProfilesCollectionResults(request, hFake);

      // then
      expect(response.headers['content-disposition']).to.equal(
        'attachment; filename="file-name with invalid_chars _____________.csv"',
      );
    });
  });

  describe('#getCsvAssessmentResults', function () {
    it('should call the use case to get result campaign in csv', async function () {
      // given
      const campaignId = 2;
      const request = _getRequestForCampaignId(campaignId);

      sinon.stub(usecases, 'startWritingCampaignAssessmentResultsToStream').resolves({ fileName: 'any file name' });

      // when
      await campaignDetailController.getCsvAssessmentResults(request, hFake);

      // then
      expect(usecases.startWritingCampaignAssessmentResultsToStream).to.have.been.calledOnce;
      const getResultsCampaignArgs = usecases.startWritingCampaignAssessmentResultsToStream.firstCall.args[0];
      expect(getResultsCampaignArgs).to.have.property('campaignId');
    });

    it('should return a response with correct headers', async function () {
      // given
      const campaignId = 2;
      const request = _getRequestForCampaignId(campaignId);

      sinon
        .stub(usecases, 'startWritingCampaignAssessmentResultsToStream')
        .resolves({ fileName: 'expected file name' });

      // when
      const response = await campaignDetailController.getCsvAssessmentResults(request, hFake);

      // then
      expect(response.headers['content-type']).to.equal('text/csv;charset=utf-8');
      expect(response.headers['content-disposition']).to.equal('attachment; filename="expected file name"');
      expect(response.headers['content-encoding']).to.equal('identity');
    });

    it('should fix invalid header chars in filename', async function () {
      // given
      const campaignId = 2;
      const request = _getRequestForCampaignId(campaignId);

      sinon.stub(usecases, 'startWritingCampaignAssessmentResultsToStream').resolves({
        fileName: 'file-name with invalid_chars •’<>:"/\\|?*"\n.csv',
      });

      // when
      const response = await campaignDetailController.getCsvAssessmentResults(request, hFake);

      // then
      expect(response.headers['content-disposition']).to.equal(
        'attachment; filename="file-name with invalid_chars _____________.csv"',
      );
    });
  });
});

function _getRequestForCampaignId(campaignId) {
  return {
    query: {
      accessToken: 'token',
    },
    params: {
      id: campaignId,
    },
    i18n: {
      __: sinon.stub(),
    },
  };
}
