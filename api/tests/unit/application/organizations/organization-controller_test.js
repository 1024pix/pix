const {
  domainBuilder,
  expect,
  generateValidRequestAuthorizationHeader,
  hFake,
  sinon,
} = require('../../../test-helper');

const Organization = require('../../../../lib/domain/models/Organization');
const OrganizationInvitation = require('../../../../lib/domain/models/OrganizationInvitation');
const Membership = require('../../../../lib/domain/models/Membership');
const ScoOrganizationParticipant = require('../../../../lib/domain/read-models/ScoOrganizationParticipant');
const SupOrganizationParticipant = require('../../../../lib/domain/read-models/SupOrganizationParticipant');

const organizationController = require('../../../../lib/application/organizations/organization-controller');
const usecases = require('../../../../lib/domain/usecases/index.js');
const tokenService = require('../../../../lib/domain/services/token-service');

const campaignManagementSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign-management-serializer');
const campaignReportSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign-report-serializer');
const organizationInvitationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/organization-invitation-serializer');
const organizationParticipantsSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/organization/organization-participants-serializer');
const organizationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/organization-serializer');
const organizationPlacesLotManagementSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/organization/organization-places-lot-management-serializer');
const organizationPlacesLotSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/organization/organization-places-lot-serializer');
const organizationForAdminSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/organization-for-admin-serializer');
const TargetProfileForSpecifierSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign/target-profile-for-specifier-serializer');
const organizationMemberIdentitySerializer = require('../../../../lib/infrastructure/serializers/jsonapi/organization-member-identity-serializer');
const certificationResultUtils = require('../../../../lib/infrastructure/utils/csv/certification-results');
const queryParamsUtils = require('../../../../lib/infrastructure/utils/query-params-utils');
const certificationAttestationPdf = require('../../../../lib/infrastructure/utils/pdf/certification-attestation-pdf');

const { getI18n } = require('../../../tooling/i18n/i18n');
const scoOrganizationParticipantsSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/organization/sco-organization-participants-serializer');
const supOrganizationParticipantsSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/organization/sup-organization-participants-serializer');

describe('Unit | Application | Organizations | organization-controller', function () {
  let request;

  describe('#getOrganizationDetails', function () {
    it('should call the usecase and serialize the response', async function () {
      // given
      const organizationId = 1234;
      const request = { params: { id: organizationId } };

      const organizationDetails = Symbol('organizationDetails');
      const organizationDetailsSerialized = Symbol('organizationDetailsSerialized');
      sinon.stub(usecases, 'getOrganizationDetails').withArgs({ organizationId }).resolves(organizationDetails);
      sinon
        .stub(organizationForAdminSerializer, 'serialize')
        .withArgs(organizationDetails)
        .returns(organizationDetailsSerialized);

      // when
      const result = await organizationController.getOrganizationDetails(request, hFake);

      // then
      expect(result).to.equal(organizationDetailsSerialized);
    });
  });

  describe('#findOrganizationPlacesLot', function () {
    it('should call the usecase and serialize the response', async function () {
      // given
      const organizationId = 1234;
      const request = { params: { id: organizationId } };

      const organizationPlaces = Symbol('organizationPlaces');
      const organizationPlacesSerialized = Symbol('organizationPlacesSerialized');
      sinon.stub(usecases, 'findOrganizationPlacesLot').withArgs({ organizationId }).resolves(organizationPlaces);
      sinon
        .stub(organizationPlacesLotManagementSerializer, 'serialize')
        .withArgs(organizationPlaces)
        .returns(organizationPlacesSerialized);

      // when
      const result = await organizationController.findOrganizationPlacesLot(request, hFake);

      // then
      expect(result).to.equal(organizationPlacesSerialized);
    });
  });

  describe('#createOrganizationPlacesLot', function () {
    beforeEach(function () {
      sinon.stub(usecases, 'createOrganizationPlacesLot');
      sinon.stub(organizationPlacesLotManagementSerializer, 'serialize');
      sinon.stub(organizationPlacesLotSerializer, 'deserialize');
    });

    context('successful case', function () {
      it('should create a lot of organization places', async function () {
        // given
        const OrganizationPlacesLotToCreate = domainBuilder.buildOrganizationPlacesLot();

        const createdBy = Symbol('createdBy');
        const organizationId = Symbol('organizationId');
        const organizationPlacesLotData = Symbol('organizationPlacesLotData');
        const organizationPlacesLot = Symbol('organizationPlacesLot');
        const organizationPlacesLotSerialized = Symbol('OrganizationPlacesSetSerlialized');

        const request = {
          params: {
            id: organizationId,
          },
          auth: { credentials: { accessToken: 'valid.access.token', userId: createdBy } },
          payload: {
            data: {
              attributes: {
                'organization-id': OrganizationPlacesLotToCreate.organizationId,
                count: OrganizationPlacesLotToCreate.count,
                'activation-date': OrganizationPlacesLotToCreate.activationDate,
                'expiration-date': OrganizationPlacesLotToCreate.expirationDate,
                reference: OrganizationPlacesLotToCreate.reference,
                category: OrganizationPlacesLotToCreate.category,
                'created-by': OrganizationPlacesLotToCreate.createdBy,
              },
            },
          },
        };

        organizationPlacesLotSerializer.deserialize.withArgs(request.payload).returns(organizationPlacesLotData);
        usecases.createOrganizationPlacesLot
          .withArgs({
            organizationPlacesLotData,
            organizationId,
            createdBy,
          })
          .returns(organizationPlacesLot);
        organizationPlacesLotManagementSerializer.serialize
          .withArgs(organizationPlacesLot)
          .returns(organizationPlacesLotSerialized);

        // when
        const response = await organizationController.createOrganizationPlacesLot(request, hFake);
        // then
        expect(response.source).to.be.equal(organizationPlacesLotSerialized);
      });
    });
  });

  describe('#getDivisions', function () {
    it('Should return a serialized list of divisions', async function () {
      // given
      const request = {
        auth: {
          credentials: { userId: '111' },
        },
        params: {
          id: 99,
        },
      };

      sinon
        .stub(usecases, 'findDivisionsByOrganization')
        .withArgs({ organizationId: 99 })
        .resolves([{ name: '3A' }, { name: '3B' }, { name: '4C' }]);

      // when
      const response = await organizationController.getDivisions(request, hFake);

      // then
      expect(response).to.deep.equal({
        data: [
          {
            type: 'divisions',
            id: '3A',
            attributes: {
              name: '3A',
            },
          },
          {
            type: 'divisions',
            id: '3B',
            attributes: {
              name: '3B',
            },
          },
          {
            type: 'divisions',
            id: '4C',
            attributes: {
              name: '4C',
            },
          },
        ],
      });
    });
  });

  describe('#updateOrganizationInformation', function () {
    it('should return the serialized organization', async function () {
      // given
      const organizationAttributes = {
        id: 7,
        name: 'Acme',
        type: 'SCO',
        logoUrl: 'logo',
        externalId: '02A2145V',
        provinceCode: '02A',
        email: 'sco.generic.newaccount@example.net',
        credit: 50,
      };
      const tagAttributes = { id: '4', type: 'tags' };
      const request = {
        payload: {
          data: {
            id: organizationAttributes.id,
            attributes: {
              name: organizationAttributes.name,
              type: organizationAttributes.type,
              'logo-url': organizationAttributes.logoUrl,
              'external-id': organizationAttributes.externalId,
              'province-code': organizationAttributes.provinceCode,
              email: organizationAttributes.email,
              credit: organizationAttributes.credit,
            },
          },
          relationships: {
            tags: {
              data: [tagAttributes],
            },
          },
        },
      };
      const tagWithoutName = domainBuilder.buildTag({ id: tagAttributes.id, name: undefined });
      const tag = domainBuilder.buildTag({ id: tagAttributes.id, name: 'SCO' });
      const organizationDeserialized = domainBuilder.buildOrganization({
        ...organizationAttributes,
        tags: [tagWithoutName],
      });
      const updatedOrganization = domainBuilder.buildOrganization({
        ...organizationAttributes,
        tags: [tag],
      });
      const serializedOrganization = Symbol('the updated and serialized organization');

      sinon.stub(usecases, 'updateOrganizationInformation');
      sinon.stub(organizationForAdminSerializer, 'serialize');
      sinon.stub(organizationForAdminSerializer, 'deserialize');

      organizationForAdminSerializer.deserialize.withArgs(request.payload).returns(organizationDeserialized);
      usecases.updateOrganizationInformation
        .withArgs({ organization: organizationDeserialized })
        .resolves(updatedOrganization);
      organizationForAdminSerializer.serialize.withArgs(updatedOrganization).returns(serializedOrganization);

      // when
      const response = await organizationController.updateOrganizationInformation(request, hFake);

      // then
      expect(response).to.deep.equal(serializedOrganization);
    });
  });

  describe('#findPaginatedFilteredOrganizations', function () {
    beforeEach(function () {
      sinon.stub(queryParamsUtils, 'extractParameters');
      sinon.stub(usecases, 'findPaginatedFilteredOrganizations');
      sinon.stub(organizationSerializer, 'serialize');
    });

    it('should return a list of JSON API organizations fetched from the data repository', async function () {
      // given
      const request = { query: {} };
      queryParamsUtils.extractParameters.withArgs({}).returns({});
      usecases.findPaginatedFilteredOrganizations.resolves({ models: {}, pagination: {} });
      organizationSerializer.serialize.returns({ data: {}, meta: {} });

      // when
      await organizationController.findPaginatedFilteredOrganizations(request, hFake);

      // then
      expect(usecases.findPaginatedFilteredOrganizations).to.have.been.calledOnce;
      expect(organizationSerializer.serialize).to.have.been.calledOnce;
    });

    it('should return a JSON API response with pagination information in the data field "meta"', async function () {
      // given
      const request = { query: {} };
      const expectedResults = [new Organization({ id: 1 }), new Organization({ id: 2 }), new Organization({ id: 3 })];
      const expectedPagination = { page: 2, pageSize: 25, itemsCount: 100, pagesCount: 4 };
      queryParamsUtils.extractParameters.withArgs({}).returns({});
      usecases.findPaginatedFilteredOrganizations.resolves({ models: expectedResults, pagination: expectedPagination });

      // when
      await organizationController.findPaginatedFilteredOrganizations(request, hFake);

      // then
      expect(organizationSerializer.serialize).to.have.been.calledWithExactly(expectedResults, expectedPagination);
    });

    it('should allow to filter organization by name', async function () {
      // given
      const query = { filter: { name: 'organization_name' }, page: {} };
      const request = { query };
      queryParamsUtils.extractParameters.withArgs(query).returns(query);
      usecases.findPaginatedFilteredOrganizations.resolves({ models: {}, pagination: {} });

      // when
      await organizationController.findPaginatedFilteredOrganizations(request, hFake);

      // then
      expect(usecases.findPaginatedFilteredOrganizations).to.have.been.calledWithMatch(query);
    });

    it('should allow to filter organization by code', async function () {
      // given
      const query = { filter: { code: 'organization_code' }, page: {} };
      const request = { query };
      queryParamsUtils.extractParameters.withArgs(query).returns(query);
      usecases.findPaginatedFilteredOrganizations.resolves({ models: {}, pagination: {} });

      // when
      await organizationController.findPaginatedFilteredOrganizations(request, hFake);

      // then
      expect(usecases.findPaginatedFilteredOrganizations).to.have.been.calledWithMatch(query);
    });

    it('should allow to filter users by type', async function () {
      // given
      const query = { filter: { type: 'organization_type' }, page: {} };
      const request = { query };
      queryParamsUtils.extractParameters.withArgs(query).returns(query);
      usecases.findPaginatedFilteredOrganizations.resolves({ models: {}, pagination: {} });

      // when
      await organizationController.findPaginatedFilteredOrganizations(request, hFake);

      // then
      expect(usecases.findPaginatedFilteredOrganizations).to.have.been.calledWithMatch(query);
    });

    it('should allow to paginate on a given page and page size', async function () {
      // given
      const query = { filter: { name: 'organization_name' }, page: { number: 2, size: 25 } };
      const request = { query };
      queryParamsUtils.extractParameters.withArgs(query).returns(query);
      usecases.findPaginatedFilteredOrganizations.resolves({ models: {}, pagination: {} });

      // when
      await organizationController.findPaginatedFilteredOrganizations(request, hFake);

      // then
      expect(usecases.findPaginatedFilteredOrganizations).to.have.been.calledWithMatch(query);
    });
  });

  describe('#findPaginatedFilteredCampaigns', function () {
    let organizationId;
    let request;
    let campaign;
    let serializedCampaigns;

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

      sinon.stub(queryParamsUtils, 'extractParameters');
      sinon.stub(usecases, 'findPaginatedFilteredOrganizationCampaigns');
      sinon.stub(campaignReportSerializer, 'serialize');
    });

    it('should call the usecase to get the campaigns and associated campaignReports', async function () {
      // given
      request.query = {
        campaignReport: true,
      };
      const expectedPage = 2;
      const expectedFilter = { name: 'Math' };
      queryParamsUtils.extractParameters
        .withArgs(request.query)
        .returns({ page: expectedPage, filter: expectedFilter });
      const expectedResults = [campaign];
      const expectedPagination = { page: expectedPage, pageSize: 25, itemsCount: 100, pagesCount: 4 };
      usecases.findPaginatedFilteredOrganizationCampaigns.resolves({
        models: expectedResults,
        pagination: expectedPagination,
      });
      campaignReportSerializer.serialize.returns({ data: serializedCampaigns, meta: {} });

      // when
      await organizationController.findPaginatedFilteredCampaigns(request, hFake);

      // then
      expect(usecases.findPaginatedFilteredOrganizationCampaigns).to.have.been.calledWith({
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
      queryParamsUtils.extractParameters.withArgs({}).returns({ filter: {} });
      usecases.findPaginatedFilteredOrganizationCampaigns.resolves({ models: {}, pagination: {} });
      campaignReportSerializer.serialize.returns(expectedResponse);

      // when
      const response = await organizationController.findPaginatedFilteredCampaigns(request, hFake);

      // then
      expect(response).to.deep.equal(expectedResponse);
    });

    it('should return a JSON API response with meta information', async function () {
      // given
      request.query = {};
      const expectedResults = [campaign];
      const expectedPagination = { page: 2, pageSize: 25, itemsCount: 100, pagesCount: 4, hasCampaigns: true };
      queryParamsUtils.extractParameters.withArgs({}).returns({ filter: {} });
      usecases.findPaginatedFilteredOrganizationCampaigns.resolves({
        models: expectedResults,
        meta: expectedPagination,
      });

      // when
      await organizationController.findPaginatedFilteredCampaigns(request, hFake);

      // then
      expect(campaignReportSerializer.serialize).to.have.been.calledWithExactly(expectedResults, expectedPagination);
    });
  });

  describe('#findPaginatedCampaignManagements', function () {
    let organizationId;
    let request;
    let campaign;
    let serializedCampaigns;

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

      sinon.stub(queryParamsUtils, 'extractParameters');
      sinon.stub(usecases, 'findPaginatedCampaignManagements');
      sinon.stub(campaignManagementSerializer, 'serialize');
    });

    it('should call the usecase to get the campaigns and associated campaignManagements', async function () {
      // given
      request.query = {
        campaignManagement: true,
      };
      const expectedPage = 2;
      const expectedFilter = { name: 'Math' };
      queryParamsUtils.extractParameters
        .withArgs(request.query)
        .returns({ page: expectedPage, filter: expectedFilter });
      const expectedResults = [campaign];
      const expectedPagination = { page: expectedPage, pageSize: 25, itemsCount: 100, pagesCount: 4 };
      usecases.findPaginatedCampaignManagements.resolves({ models: expectedResults, pagination: expectedPagination });
      campaignManagementSerializer.serialize.returns({ data: serializedCampaigns, meta: {} });

      // when
      await organizationController.findPaginatedCampaignManagements(request, hFake);

      // then
      expect(usecases.findPaginatedCampaignManagements).to.have.been.calledWith({
        organizationId,
        filter: expectedFilter,
        page: expectedPage,
      });
    });

    it('should return the serialized campaigns belonging to the organization', async function () {
      // given
      request.query = {};
      const expectedResponse = { data: serializedCampaigns, meta: {} };

      const expectedResults = [campaign];
      const expectedPagination = { page: 2, pageSize: 25, itemsCount: 100, pagesCount: 4 };
      queryParamsUtils.extractParameters.withArgs({}).returns({ filter: {} });
      usecases.findPaginatedCampaignManagements.resolves({ models: expectedResults, meta: expectedPagination });
      campaignManagementSerializer.serialize.withArgs(expectedResults, expectedPagination).returns(expectedResponse);

      // when
      const response = await organizationController.findPaginatedCampaignManagements(request, hFake);

      // then
      expect(response).to.deep.equal(expectedResponse);
    });
  });

  describe('#findTargetProfiles', function () {
    it('should reply 200 with serialized target profiles', async function () {
      // given
      const connectedUserId = 1;
      const organizationId = 145;

      const request = {
        auth: { credentials: { userId: connectedUserId } },
        params: { id: organizationId },
      };

      const foundTargetProfiles = Symbol('TargetProfile');

      sinon.stub(usecases, 'getAvailableTargetProfilesForOrganization');
      sinon.stub(TargetProfileForSpecifierSerializer, 'serialize');

      usecases.getAvailableTargetProfilesForOrganization.withArgs({ organizationId }).resolves(foundTargetProfiles);
      TargetProfileForSpecifierSerializer.serialize.withArgs(foundTargetProfiles).returns({});

      // when
      const response = await organizationController.findTargetProfiles(request, hFake);

      // then
      expect(response).to.deep.equal({});
    });
  });

  describe('#attachTargetProfiles', function () {
    let request;

    it('should succeed', async function () {
      // given
      sinon.stub(usecases, 'attachTargetProfilesToOrganization');
      request = {
        params: {
          id: 123,
        },
        payload: {
          'target-profile-ids': [1, 2],
        },
      };
      usecases.attachTargetProfilesToOrganization.resolves();

      // when
      const response = await organizationController.attachTargetProfiles(request, hFake);

      // then
      expect(response.statusCode).to.equal(204);
      expect(usecases.attachTargetProfilesToOrganization).to.have.been.calledWithExactly({
        organizationId: 123,
        targetProfileIds: [1, 2],
      });
    });
  });

  describe('#findTargetProfileSummariesForAdmin', function () {
    it('should return serialized summaries', async function () {
      // given
      sinon.stub(usecases, 'findOrganizationTargetProfileSummariesForAdmin');
      const request = {
        params: { id: 123 },
      };
      const targetProfileSummary = domainBuilder.buildTargetProfileSummaryForAdmin({
        id: 456,
        name: 'Super profil cible',
        outdated: false,
      });
      usecases.findOrganizationTargetProfileSummariesForAdmin
        .withArgs({ organizationId: 123 })
        .resolves([targetProfileSummary]);

      // when
      const response = await organizationController.findTargetProfileSummariesForAdmin(request);

      // then
      expect(response).to.deep.equal({
        data: [
          {
            type: 'target-profile-summaries',
            id: '456',
            attributes: {
              name: 'Super profil cible',
              outdated: false,
            },
          },
        ],
      });
    });
  });

  describe('#findPaginatedFilteredScoParticipants', function () {
    const connectedUserId = 1;
    const organizationId = 145;

    let scoOrganizationParticipant;
    let serializedScoOrganizationParticipant;
    let request;

    beforeEach(function () {
      request = {
        auth: { credentials: { userId: connectedUserId } },
        params: { id: organizationId },
      };

      sinon.stub(usecases, 'findPaginatedFilteredScoParticipants');
      sinon.stub(scoOrganizationParticipantsSerializer, 'serialize');

      scoOrganizationParticipant = new ScoOrganizationParticipant();
      serializedScoOrganizationParticipant = {
        data: [
          {
            ...scoOrganizationParticipant,
            isAuthenticatedFromGAR: false,
          },
        ],
        meta: { pagination: { page: 1 } },
      };
    });

    it('should call the usecase to find sco participants with users infos related to the organization id', async function () {
      // given
      usecases.findPaginatedFilteredScoParticipants.resolves({});

      // when
      await organizationController.findPaginatedFilteredScoParticipants(request, hFake);

      // then
      expect(usecases.findPaginatedFilteredScoParticipants).to.have.been.calledWith({
        organizationId,
        filter: {},
        page: {},
        sort: {},
      });
    });

    it('should call the usecase to find sco participants with users infos related to filters', async function () {
      // given
      request = {
        ...request,
        query: {
          'filter[lastName]': 'Bob',
          'filter[firstName]': 'Tom',
          'filter[connectionTypes]': 'email',
          'filter[divisions][]': 'D1',
        },
      };
      usecases.findPaginatedFilteredScoParticipants.resolves({});

      // when
      await organizationController.findPaginatedFilteredScoParticipants(request, hFake);

      // then
      expect(usecases.findPaginatedFilteredScoParticipants).to.have.been.calledWith({
        organizationId,
        filter: { lastName: 'Bob', firstName: 'Tom', connectionTypes: ['email'], divisions: ['D1'] },
        page: {},
        sort: {},
      });
    });
    it('should call the usecase to find sco participants with users infos related to sort', async function () {
      // given
      request = {
        ...request,
        query: {
          'sort[participationCount]': 'asc',
          'sort[lastnameSort]': 'asc',
        },
      };
      usecases.findPaginatedFilteredScoParticipants.resolves({});

      // when
      await organizationController.findPaginatedFilteredScoParticipants(request, hFake);

      // then
      expect(usecases.findPaginatedFilteredScoParticipants).to.have.been.calledWith({
        organizationId,
        filter: {},
        page: {},
        sort: {
          participationCount: 'asc',
          lastnameSort: 'asc',
        },
      });
    });

    it('should call the usecase to find sco participants with users infos related to pagination', async function () {
      // given
      request = { ...request, query: { 'page[size]': 10, 'page[number]': 1 } };
      usecases.findPaginatedFilteredScoParticipants.resolves({});

      // when
      await organizationController.findPaginatedFilteredScoParticipants(request, hFake);

      // then
      expect(usecases.findPaginatedFilteredScoParticipants).to.have.been.calledWith({
        organizationId,
        filter: {},
        page: { size: 10, number: 1 },
        sort: {},
      });
    });

    it('should return the serialized sco participants belonging to the organization', async function () {
      // given
      const meta = { pagination: { page: 1 } };
      const scoOrganizationParticipants = [scoOrganizationParticipant];
      usecases.findPaginatedFilteredScoParticipants.resolves({ data: scoOrganizationParticipants, meta });
      scoOrganizationParticipantsSerializer.serialize
        .withArgs({ scoOrganizationParticipants, meta })
        .returns(serializedScoOrganizationParticipant);

      // when
      const response = await organizationController.findPaginatedFilteredScoParticipants(request, hFake);
      // then
      expect(response).to.deep.equal(serializedScoOrganizationParticipant);
    });

    it('map all certificability values', async function () {
      // given
      request = {
        auth: { credentials: { userId: connectedUserId } },
        params: { id: organizationId },
        query: {
          'filter[certificability][]': ['eligible', 'non-eligible', 'not-available'],
        },
      };
      usecases.findPaginatedFilteredScoParticipants.resolves({ data: [] });
      scoOrganizationParticipantsSerializer.serialize.returns({});

      // when
      await organizationController.findPaginatedFilteredScoParticipants(request, hFake);

      // then
      expect(usecases.findPaginatedFilteredScoParticipants).to.have.been.calledWith({
        organizationId,
        filter: { certificability: [true, false, null] },
        page: {},
        sort: {},
      });
    });
  });

  describe('#findPaginatedFilteredSupParticipants', function () {
    const connectedUserId = 1;
    const organizationId = 145;

    let supOrganizationParticipant;
    let serializedSupOrganizationParticipant;
    let request;

    beforeEach(function () {
      request = {
        auth: { credentials: { userId: connectedUserId } },
        params: { id: organizationId },
      };

      sinon.stub(usecases, 'findPaginatedFilteredSupParticipants');
      sinon.stub(supOrganizationParticipantsSerializer, 'serialize');

      supOrganizationParticipant = new SupOrganizationParticipant();
      serializedSupOrganizationParticipant = {
        data: [
          {
            ...supOrganizationParticipant,
          },
        ],
        meta: { pagination: { page: 1 } },
      };
    });

    it('should call the usecase to find sup participants with users infos related to the organization id', async function () {
      // given
      usecases.findPaginatedFilteredSupParticipants.resolves({});

      // when
      await organizationController.findPaginatedFilteredSupParticipants(request, hFake);

      // then
      expect(usecases.findPaginatedFilteredSupParticipants).to.have.been.calledWith({
        organizationId,
        filter: {},
        page: {},
        sort: {},
      });
    });

    it('should call the usecase to find sup participants with users infos related to filters', async function () {
      // given
      request = {
        ...request,
        query: {
          'filter[lastName]': 'Bob',
          'filter[firstName]': 'Tom',
          'filter[group]': 'L1',
        },
      };
      usecases.findPaginatedFilteredSupParticipants.resolves({});

      // when
      await organizationController.findPaginatedFilteredSupParticipants(request, hFake);

      // then
      expect(usecases.findPaginatedFilteredSupParticipants).to.have.been.calledWith({
        organizationId,
        filter: { lastName: 'Bob', firstName: 'Tom', group: 'L1' },
        page: {},
        sort: {},
      });
    });

    it('should call the usecase to find sup participants with users infos related to sort', async function () {
      // given
      request = {
        ...request,
        query: {
          'sort[participationCount]': 'asc',
          'sort[lastnameSort]': 'asc',
        },
      };
      usecases.findPaginatedFilteredSupParticipants.resolves({});

      // when
      await organizationController.findPaginatedFilteredSupParticipants(request, hFake);

      // then
      expect(usecases.findPaginatedFilteredSupParticipants).to.have.been.calledWith({
        organizationId,
        filter: {},
        page: {},
        sort: {
          participationCount: 'asc',
          lastnameSort: 'asc',
        },
      });
    });
    it('should call the usecase to find sup participants with users infos related to pagination', async function () {
      // given
      request = { ...request, query: { 'page[size]': 10, 'page[number]': 1 } };
      usecases.findPaginatedFilteredSupParticipants.resolves({});

      // when
      await organizationController.findPaginatedFilteredSupParticipants(request, hFake);

      // then
      expect(usecases.findPaginatedFilteredSupParticipants).to.have.been.calledWith({
        organizationId,
        filter: {},
        page: { size: 10, number: 1 },
        sort: {},
      });
    });

    it('should return the serialized sup participants belonging to the organization', async function () {
      // given
      const meta = { pagination: { page: 1 } };
      const supOrganizationParticipants = [supOrganizationParticipant];
      usecases.findPaginatedFilteredSupParticipants.resolves({ data: supOrganizationParticipants, meta });
      supOrganizationParticipantsSerializer.serialize
        .withArgs({ supOrganizationParticipants, meta })
        .returns(serializedSupOrganizationParticipant);

      // when
      const response = await organizationController.findPaginatedFilteredSupParticipants(request, hFake);

      // then
      expect(response).to.deep.equal(serializedSupOrganizationParticipant);
    });

    it('map all certificability values', async function () {
      // given
      request = {
        auth: { credentials: { userId: connectedUserId } },
        params: { id: organizationId },
        query: {
          'filter[certificability][]': ['eligible', 'non-eligible', 'not-available'],
        },
      };
      usecases.findPaginatedFilteredSupParticipants.resolves({ data: [] });
      supOrganizationParticipantsSerializer.serialize.returns({});

      // when
      await organizationController.findPaginatedFilteredSupParticipants(request, hFake);

      // then
      expect(usecases.findPaginatedFilteredSupParticipants).to.have.been.calledWith({
        organizationId,
        filter: { certificability: [true, false, null] },
        page: {},
        sort: {},
      });
    });
  });

  describe('#importorganizationLearnersFromSIECLE', function () {
    const connectedUserId = 1;
    const organizationId = 145;
    const payload = { path: 'path-to-file' };
    const format = 'xml';

    const request = {
      auth: { credentials: { userId: connectedUserId } },
      params: { id: organizationId },
      query: { format },
      payload,
    };

    beforeEach(function () {
      sinon.stub(usecases, 'importOrganizationLearnersFromSIECLEFormat');
      usecases.importOrganizationLearnersFromSIECLEFormat.resolves();
    });

    it('should call the usecase to import organizationLearners', async function () {
      // given
      request.i18n = getI18n();
      hFake.request = {
        path: '/api/organizations/145/sco-organization-learners/import-siecle',
      };

      // when
      await organizationController.importOrganizationLearnersFromSIECLE(request, hFake);

      // then
      expect(usecases.importOrganizationLearnersFromSIECLEFormat).to.have.been.calledWith({
        organizationId,
        payload,
        format,
        i18n: request.i18n,
      });
    });
  });

  describe('#sendInvitations', function () {
    const userId = 1;
    let invitation;
    let organizationId;
    let emails;
    const locale = 'fr-fr';

    beforeEach(function () {
      invitation = domainBuilder.buildOrganizationInvitation();
      organizationId = invitation.organizationId;
      emails = [invitation.email];
      request = {
        auth: { credentials: { userId } },
        params: { id: organizationId },
        payload: {
          data: {
            type: 'organization-invitations',
            attributes: {
              email: invitation.email,
            },
          },
        },
      };
    });

    it('should call the usecase to create invitation with organizationId, email and locale', async function () {
      sinon.stub(usecases, 'createOrganizationInvitations').resolves([{ id: 1 }]);

      // when
      await organizationController.sendInvitations(request, hFake);

      // then
      expect(usecases.createOrganizationInvitations).to.have.been.calledWith({ organizationId, emails, locale });
    });
  });

  describe('#cancelOrganizationInvitation', function () {
    it('should call the use case to cancel invitation with organizationInvitationId', async function () {
      //given
      const organizationInvitationId = 123;

      const request = {
        auth: { credentials: { userId: 1 } },
        params: { organizationInvitationId },
      };
      const cancelledOrganizationInvitation = domainBuilder.buildOrganizationInvitation({
        id: organizationInvitationId,
        status: OrganizationInvitation.StatusType.CANCELLED,
      });

      sinon
        .stub(usecases, 'cancelOrganizationInvitation')
        .withArgs({
          organizationInvitationId: cancelledOrganizationInvitation.id,
        })
        .resolves(cancelledOrganizationInvitation);
      const serializedResponse = Symbol('serializedCancelledOrganizationInvitation');

      sinon
        .stub(organizationInvitationSerializer, 'serialize')
        .withArgs(cancelledOrganizationInvitation)
        .returns(serializedResponse);

      // when
      const response = await organizationController.cancelOrganizationInvitation(request, hFake);

      // then
      expect(response.statusCode).to.equal(204);
    });
  });

  describe('#sendInvitationByLangAndRole', function () {
    it('should call the usecase to create invitation with organizationId, email, role and lang', async function () {
      //given
      const userId = 1;
      const invitation = domainBuilder.buildOrganizationInvitation();

      const organizationId = invitation.organizationId;
      const email = invitation.email;
      const lang = 'en';
      const role = Membership.roles.ADMIN;
      const serializedInvitation = Symbol();

      const request = {
        auth: { credentials: { userId } },
        params: { id: organizationId },
        payload: {
          data: {
            type: 'organization-invitations',
            attributes: {
              email: invitation.email,
              lang,
              role,
            },
          },
        },
      };

      sinon
        .stub(organizationInvitationSerializer, 'deserializeForCreateOrganizationInvitationAndSendEmail')
        .withArgs(request.payload)
        .returns({ lang, role, email });
      sinon
        .stub(usecases, 'createOrganizationInvitationByAdmin')
        .withArgs({
          organizationId,
          email: email,
          locale: lang,
          role,
        })
        .resolves(invitation);
      sinon.stub(organizationInvitationSerializer, 'serialize').withArgs(invitation).returns(serializedInvitation);

      // when
      const response = await organizationController.sendInvitationByLangAndRole(request, hFake);

      // then
      expect(response.statusCode).to.be.equal(201);
      expect(response.source).to.be.equal(serializedInvitation);
    });
  });

  describe('#findPendingInvitations', function () {
    const userId = 1;
    let organization;
    const resolvedOrganizationInvitations = 'organization invitations';
    const serializedOrganizationInvitations = 'serialized organization invitations';

    let request;
    beforeEach(function () {
      organization = domainBuilder.buildOrganization();
      request = {
        auth: { credentials: { userId } },
        params: { id: organization.id },
      };

      sinon.stub(usecases, 'findPendingOrganizationInvitations');
      sinon.stub(organizationInvitationSerializer, 'serialize');
    });

    it('should call the usecase to find pending invitations with organizationId', async function () {
      usecases.findPendingOrganizationInvitations.resolves(resolvedOrganizationInvitations);
      organizationInvitationSerializer.serialize.resolves(serializedOrganizationInvitations);

      // when
      const response = await organizationController.findPendingInvitations(request, hFake);

      // then
      expect(usecases.findPendingOrganizationInvitations).to.have.been.calledWith({ organizationId: organization.id });
      expect(organizationInvitationSerializer.serialize).to.have.been.calledWith(resolvedOrganizationInvitations);
      expect(response).to.deep.equal(serializedOrganizationInvitations);
    });
  });

  describe('#getOrganizationLearnersCsvTemplate', function () {
    const userId = 1;
    const organizationId = 2;
    const request = {
      query: {
        accessToken: 'token',
      },
      params: {
        id: organizationId,
      },
    };

    beforeEach(function () {
      sinon.stub(usecases, 'getOrganizationLearnersCsvTemplate').resolves('template');
      sinon.stub(tokenService, 'extractUserId').returns(userId);
    });

    it('should return a response with correct headers', async function () {
      // when
      request.i18n = getI18n();
      hFake.request = {
        path: '/api/organizations/2/sup-organization-learners/csv-template',
      };
      const response = await organizationController.getOrganizationLearnersCsvTemplate(request, hFake);

      // then
      expect(response.headers['Content-Type']).to.equal('text/csv;charset=utf-8');
      expect(response.headers['Content-Disposition']).to.equal('attachment; filename=modele-import.csv');
    });
  });

  describe('#downloadCertificationResults', function () {
    const now = new Date('2019-01-01T05:06:07Z');
    let clock;
    beforeEach(function () {
      clock = sinon.useFakeTimers(now);
    });
    afterEach(function () {
      clock.restore();
    });
    it('should return a response with CSV results', async function () {
      // given
      const request = {
        params: {
          id: 1,
        },
        query: {
          division: '3èmeA',
        },
      };

      const certificationResults = [
        domainBuilder.buildCertificationResult({ isPublished: true }),
        domainBuilder.buildCertificationResult({ isPublished: true }),
        domainBuilder.buildCertificationResult({ isPublished: true }),
      ];

      sinon
        .stub(usecases, 'getScoCertificationResultsByDivision')
        .withArgs({ organizationId: 1, division: '3èmeA' })
        .resolves(certificationResults);

      sinon
        .stub(certificationResultUtils, 'getDivisionCertificationResultsCsv')
        .withArgs({ certificationResults })
        .resolves('csv-string');

      // when
      const response = await organizationController.downloadCertificationResults(request, hFake);

      // then
      expect(response.source).to.equal('csv-string');
      expect(response.headers['Content-Type']).to.equal('text/csv;charset=utf-8');
      expect(response.headers['Content-Disposition']).to.equal('attachment; filename="20190101_resultats_3èmeA.csv"');
    });
  });

  describe('#downloadCertificationAttestationsForDivision', function () {
    const now = new Date('2019-01-01T05:06:07Z');
    let clock;
    beforeEach(function () {
      clock = sinon.useFakeTimers(now);
    });
    afterEach(function () {
      clock.restore();
    });
    it('should return binary attestations', async function () {
      // given
      const certifications = [
        domainBuilder.buildPrivateCertificateWithCompetenceTree(),
        domainBuilder.buildPrivateCertificateWithCompetenceTree(),
      ];
      const organizationId = domainBuilder.buildOrganization().id;
      const division = '3b';
      const attestationsPDF = 'binary string';
      const userId = 1;

      const request = {
        auth: { credentials: { userId } },
        params: { id: organizationId },
        query: { division, isFrenchDomainExtension: true },
      };

      sinon
        .stub(usecases, 'findCertificationAttestationsForDivision')
        .withArgs({
          division,
          organizationId,
        })
        .resolves(certifications);
      sinon
        .stub(certificationAttestationPdf, 'getCertificationAttestationsPdfBuffer')
        .withArgs({ certificates: certifications, isFrenchDomainExtension: true })
        .resolves({ buffer: attestationsPDF });

      // when
      const response = await organizationController.downloadCertificationAttestationsForDivision(request, hFake);

      // then
      expect(response.source).to.deep.equal(attestationsPDF);
      expect(response.headers['Content-Disposition']).to.contains('attachment; filename=20190101_attestations_3b.pdf');
    });
  });

  describe('#getOrganizationMemberIdentities', function () {
    it('should return all members idendities of the organization serialized', async function () {
      // given
      const organizationId = 1234;
      const members = Symbol('members');
      const serializedMembersIdentities = Symbol('members serialized');

      sinon.stub(usecases, 'getOrganizationMemberIdentities').withArgs({ organizationId }).returns(members);
      sinon
        .stub(organizationMemberIdentitySerializer, 'serialize')
        .withArgs(members)
        .returns(serializedMembersIdentities);

      // when
      const request = { params: { id: organizationId } };
      const result = await organizationController.getOrganizationMemberIdentities(request, hFake);

      // then
      expect(result).to.be.equal(serializedMembersIdentities);
    });
  });

  describe('#archiveOrganization', function () {
    it('should call the usecase to archive the organization with the user id', async function () {
      // given
      const organizationId = 1234;
      const userId = 10;
      const request = {
        headers: {
          authorization: generateValidRequestAuthorizationHeader(userId),
        },
        params: { id: organizationId },
      };

      const archivedOrganization = Symbol('archivedOrganization');
      const archivedOrganizationSerialized = Symbol('archivedOrganizationSerialized');
      sinon.stub(usecases, 'archiveOrganization').resolves(archivedOrganization);
      sinon
        .stub(organizationForAdminSerializer, 'serialize')
        .withArgs(archivedOrganization)
        .returns(archivedOrganizationSerialized);

      // when
      const response = await organizationController.archiveOrganization(request, hFake);

      // then
      expect(usecases.archiveOrganization).to.have.been.calledOnceWithExactly({ organizationId, userId });
      expect(response).to.deep.equal(archivedOrganizationSerialized);
    });
  });

  describe('#getPaginatedParticipantsForAnOrganization', function () {
    const connectedUserId = 1;
    const organizationId = 145;

    let request;

    beforeEach(function () {
      request = {
        auth: { credentials: { userId: connectedUserId } },
        params: { id: organizationId },
      };

      sinon.stub(usecases, 'getPaginatedParticipantsForAnOrganization');
      sinon.stub(organizationParticipantsSerializer, 'serialize');
    });

    it('should call the usecase to get the participants of the organization', async function () {
      const parameters = { page: 2, filter: { fullName: 'name' }, sort: {} };
      const organizationLearner = domainBuilder.buildOrganizationLearner();
      domainBuilder.buildCampaignParticipation({ organizationLearnerId: organizationLearner.id });

      request.query = parameters;

      const participant = {
        id: organizationLearner.id,
        firstName: organizationLearner.firstName,
        lastName: organizationLearner.lastName,
      };

      const serializedOrganizationParticipants = [
        {
          id: organizationLearner.id,
          'first-name': organizationLearner.firstName,
          'last-name': organizationLearner.lastName,
        },
      ];
      const expectedPagination = { ...parameters, pageSize: 25, itemsCount: 100, pagesCount: 4 };
      const expectedResponse = { data: serializedOrganizationParticipants, meta: {} };

      sinon.stub(queryParamsUtils, 'extractParameters').withArgs(request.query).returns(parameters);

      usecases.getPaginatedParticipantsForAnOrganization
        .withArgs({ organizationId, page: 2, filters: parameters.filter, sort: {} })
        .returns({
          organizationParticipants: [participant],
          pagination: expectedPagination,
        });
      organizationParticipantsSerializer.serialize
        .withArgs({
          organizationParticipants: [participant],
          pagination: expectedPagination,
        })
        .returns(expectedResponse);

      // when
      const response = await organizationController.getPaginatedParticipantsForAnOrganization(request, hFake);

      // then
      expect(response).to.deep.equal(expectedResponse);
    });

    it('should call the usecase to find sco participants with users infos related to sort', async function () {
      // given
      request = {
        ...request,
        query: {
          'sort[participationCount]': 'asc',
          'sort[lastnameSort]': 'asc',
        },
      };
      usecases.getPaginatedParticipantsForAnOrganization.resolves({});

      // when
      await organizationController.getPaginatedParticipantsForAnOrganization(request, hFake);

      // then
      expect(usecases.getPaginatedParticipantsForAnOrganization).to.have.been.calledWith({
        organizationId,
        filters: {},
        page: {},
        sort: {
          participationCount: 'asc',
          lastnameSort: 'asc',
        },
      });
    });
    it('map all certificability values', async function () {
      // given
      request = {
        auth: { credentials: { userId: connectedUserId } },
        params: { id: organizationId },
        query: {
          'filter[certificability][]': ['eligible', 'non-eligible', 'not-available'],
        },
      };
      usecases.getPaginatedParticipantsForAnOrganization.resolves({ data: [] });
      organizationParticipantsSerializer.serialize.returns({});

      // when
      await organizationController.getPaginatedParticipantsForAnOrganization(request, hFake);

      // then
      expect(usecases.getPaginatedParticipantsForAnOrganization).to.have.been.calledWith({
        organizationId,
        filters: { certificability: [true, false, null] },
        page: {},
        sort: {},
      });
    });
  });
});
