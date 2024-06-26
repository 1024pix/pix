import { campaignDetailController } from '../../../../../src/prescription/campaign/application/campaign-detail-controller.js';
import { usecases } from '../../../../../src/prescription/campaign/domain/usecases/index.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Application | Controller | Campaign detail', function () {
  describe('#getByCode', function () {
    let dependencies;

    it('should return the serialized campaign', async function () {
      // given
      const code = 'AZERTY123';
      const serializedCampaignToJoin = Symbol('Serialized CampaignToJoin');
      const campaignToJoin = domainBuilder.buildCampaignToJoin({ code, identityProvider: 'SUPER_IDP' });
      const request = {
        query: { filter: { code } },
      };
      dependencies = {
        campaignToJoinSerializer: { serialize: sinon.stub() },
      };
      sinon.stub(usecases, 'getCampaignByCode').withArgs({ code }).resolves(campaignToJoin);

      dependencies.campaignToJoinSerializer.serialize.withArgs(campaignToJoin).returns(serializedCampaignToJoin);
      // when
      const response = await campaignDetailController.getByCode(request, hFake, dependencies);

      // then
      expect(response).to.be.equal(serializedCampaignToJoin);
    });
  });

  describe('#getById', function () {
    const campaignId = 1;
    const userId = 1;

    let request, campaign;
    let campaignReportSerializerStub;
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
      tokenServiceStub = { createTokenForCampaignResults: sinon.stub().returns('token') };
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
      const campaignReportSerializerStub = {
        serialize: sinon.stub(),
      };
      dependencies = {
        campaignReportSerializer: campaignReportSerializerStub,
      };
      sinon.stub(usecases, 'findPaginatedFilteredOrganizationCampaigns');
    });

    it('should call the usecase to get the campaigns and associated campaignReports', async function () {
      // given
      request.query = {
        campaignReport: true,
        filter: { name: 'Math' },
        page: 2,
      };
      const expectedPage = 2;
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
        filter: { name: 'Math' },
        page: 2,
        userId: request.auth.credentials.userId,
      });
    });

    it('should return the serialized campaigns belonging to the organization', async function () {
      // given
      request.query = { filter: {} };
      const expectedResponse = { data: serializedCampaigns, meta: {} };
      usecases.findPaginatedFilteredOrganizationCampaigns.resolves({ models: {}, pagination: {} });
      dependencies.campaignReportSerializer.serialize.returns(expectedResponse);

      // when
      const response = await campaignDetailController.findPaginatedFilteredCampaigns(request, hFake, dependencies);

      // then
      expect(response).to.deep.equal(expectedResponse);
    });

    it('should return a JSON API response with meta information', async function () {
      // given
      request.query = { filter: {} };
      const expectedResults = [campaign];
      const expectedPagination = { page: 2, pageSize: 25, itemsCount: 100, pagesCount: 4, hasCampaigns: true };
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
        .resolves({ fileName: 'expected file name.csv' });

      // when
      const response = await campaignDetailController.getCsvProfilesCollectionResults(request, hFake);

      // then
      expect(response.headers['content-type']).to.equal('text/csv;charset=utf-8');
      expect(response.headers['content-disposition']).to.equal('attachment; filename="expected_file_name.csv"');
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
        'attachment; filename="file-name_with_invalid_chars_.csv"',
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
        .resolves({ fileName: 'expected file name.csv' });

      // when
      const response = await campaignDetailController.getCsvAssessmentResults(request, hFake);

      // then
      expect(response.headers['content-type']).to.equal('text/csv;charset=utf-8');
      expect(response.headers['content-disposition']).to.equal('attachment; filename="expected_file_name.csv"');
      expect(response.headers['content-encoding']).to.equal('identity');
    });

    it('should fix invalid header chars in filename', async function () {
      // given
      const campaignId = 2;
      const request = _getRequestForCampaignId(campaignId);

      sinon.stub(usecases, 'startWritingCampaignAssessmentResultsToStream').resolves({
        fileName: 'file-name_with_invalid_chars •’<>:"/\\|?*"\n.csv',
      });

      // when
      const response = await campaignDetailController.getCsvAssessmentResults(request, hFake);

      // then
      expect(response.headers['content-disposition']).to.equal(
        'attachment; filename="file-name_with_invalid_chars_.csv"',
      );
    });
  });

  describe('#findParticipantsActivity', function () {
    let serializedParticipantsActivities;
    let participantsActivities;
    const filters = { status: 'SHARED', groups: ['L1'], search: 'Choupette' };

    const campaignId = 1;
    const userId = 1;
    let campaignParticipantsActivitySerializerStub;

    beforeEach(function () {
      participantsActivities = Symbol('participants activities');
      serializedParticipantsActivities = Symbol('serialized participants activities');
      sinon.stub(usecases, 'findPaginatedCampaignParticipantsActivities');
      campaignParticipantsActivitySerializerStub = {
        serialize: sinon.stub(),
      };
    });

    it('should return the participants activities properly serialized', async function () {
      // given
      usecases.findPaginatedCampaignParticipantsActivities
        .withArgs({ campaignId, userId, page: { number: 3 }, filters })
        .resolves(participantsActivities);
      campaignParticipantsActivitySerializerStub.serialize
        .withArgs(participantsActivities)
        .returns(serializedParticipantsActivities);

      // when
      const response = await campaignDetailController.findParticipantsActivity(
        {
          params: { id: campaignId },
          auth: {
            credentials: { userId },
          },

          query: {
            page: { number: 3 },
            filter: {
              groups: ['L1'],
              status: 'SHARED',
              search: 'Choupette',
            },
          },
        },
        hFake,
        { campaignParticipantsActivitySerializer: campaignParticipantsActivitySerializerStub },
      );

      // then
      expect(response).to.be.equal(serializedParticipantsActivities);
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
