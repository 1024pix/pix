const { fn: momentProto } = require('moment');
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

const organizationController = require('../../../../lib/application/organizations/organization-controller');

const usecases = require('../../../../lib/domain/usecases');
const tokenService = require('../../../../lib/domain/services/token-service');

const campaignManagementSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign-management-serializer');
const campaignReportSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign-report-serializer');
const organizationInvitationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/organization-invitation-serializer');
const organizationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/organization-serializer');
const TargetProfileForSpecifierSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign/target-profile-for-specifier-serializer');
const userWithSchoolingRegistrationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/user-with-schooling-registration-serializer');
const organizationAttachTargetProfilesSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/organization-attach-target-profiles-serializer');
const organizationMembersSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/organization-members-serializer');
const certificationResultUtils = require('../../../../lib/infrastructure/utils/csv/certification-results');
const queryParamsUtils = require('../../../../lib/infrastructure/utils/query-params-utils');
const certificationAttestationPdf = require('../../../../lib/infrastructure/utils/pdf/certification-attestation-pdf');

const { getI18n } = require('../../../tooling/i18n/i18n');

describe('Unit | Application | Organizations | organization-controller', function () {
  let request;

  describe('#getOrganizationDetails', function () {
    it('should call the usecase and serialize the response', async function () {
      // given
      const organizationId = 1234;
      const request = { params: { id: organizationId } };

      sinon.stub(usecases, 'getOrganizationDetails');
      sinon.stub(organizationSerializer, 'serialize');
      usecases.getOrganizationDetails.resolves();
      organizationSerializer.serialize.returns();

      // when
      await organizationController.getOrganizationDetails(request, hFake);

      // then
      expect(usecases.getOrganizationDetails).to.have.been.calledOnce;
      expect(usecases.getOrganizationDetails).to.have.been.calledWith({ organizationId });
      expect(organizationSerializer.serialize).to.have.been.calledOnce;
    });
  });

  describe('#create', function () {
    beforeEach(function () {
      sinon.stub(usecases, 'createOrganization');
      sinon.stub(organizationSerializer, 'serialize');
    });

    context('successful case', function () {
      it('should create an organization', async function () {
        // given
        usecases.createOrganization.resolves();

        const pixMasterUserId = 10;
        const organizationToCreate = domainBuilder.buildOrganization();

        const request = {
          headers: {
            authorization: generateValidRequestAuthorizationHeader(pixMasterUserId),
          },
          payload: {
            data: {
              attributes: {
                email: organizationToCreate.email,
                name: organizationToCreate.name,
                type: organizationToCreate.type,
                'external-id': organizationToCreate.externalId,
                'logo-url': organizationToCreate.logoUrl,
                'province-code': organizationToCreate.provinceCode,
                'documentation-url': organizationToCreate.documentationUrl,
              },
            },
          },
        };

        // when
        await organizationController.create(request, hFake);

        // then
        expect(usecases.createOrganization).to.have.been.calledWith({
          createdBy: pixMasterUserId,
          email: organizationToCreate.email,
          name: organizationToCreate.name,
          type: organizationToCreate.type,
          externalId: organizationToCreate.externalId,
          logoUrl: organizationToCreate.logoUrl,
          provinceCode: organizationToCreate.provinceCode,
          documentationUrl: organizationToCreate.documentationUrl,
        });
      });

      it('should serialized organization into JSON:API', async function () {
        // given
        const organizationToCreate = domainBuilder.buildOrganization();

        const request = {
          payload: {
            data: {
              attributes: {
                email: organizationToCreate.email,
                name: organizationToCreate.name,
                type: organizationToCreate.type,
                'external-id': organizationToCreate.externalId,
                'logo-url': organizationToCreate.logoUrl,
                'province-code': organizationToCreate.provinceCode,
              },
            },
          },
        };

        usecases.createOrganization.resolves(organizationToCreate);

        // when
        await organizationController.create(request, hFake);

        // then
        expect(organizationSerializer.serialize).to.have.been.calledWith(organizationToCreate);
      });

      it('should return the serialized organization', async function () {
        // given
        const organizationToCreate = domainBuilder.buildOrganization();

        const request = {
          payload: {
            data: {
              attributes: {
                email: organizationToCreate.email,
                name: organizationToCreate.name,
                type: organizationToCreate.type,
                'external-id': organizationToCreate.externalId,
                'logo-url': organizationToCreate.logoUrl,
                'province-code': organizationToCreate.provinceCode,
              },
            },
          },
        };
        const serializedOrganization = { foo: 'bar' };

        usecases.createOrganization.resolves(organizationToCreate);
        organizationSerializer.serialize.withArgs(organizationToCreate).returns(serializedOrganization);

        // when
        const response = await organizationController.create(request, hFake);

        // then
        expect(response).to.deep.equal(serializedOrganization);
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
      sinon.stub(organizationSerializer, 'serialize');
      sinon.stub(organizationSerializer, 'deserialize');

      organizationSerializer.deserialize.withArgs(request.payload).returns(organizationDeserialized);
      usecases.updateOrganizationInformation
        .withArgs({ organization: organizationDeserialized })
        .resolves(updatedOrganization);
      organizationSerializer.serialize.withArgs(updatedOrganization).returns(serializedOrganization);

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
    const userId = 1;
    let targetProfile;
    let organizationId;
    let targetProfileId;
    let targetProfilesToAttachAsArray;

    beforeEach(function () {
      targetProfile = domainBuilder.buildTargetProfile();
      organizationId = targetProfile.ownerOrganizationId;
      targetProfileId = parseInt(targetProfile.id);
      targetProfilesToAttachAsArray = [targetProfileId];
      request = {
        auth: { credentials: { userId } },
        params: { id: organizationId },
        payload: {
          data: {
            type: 'target-profile-share',
            attributes: {
              'target-profiles-to-attach': [targetProfileId],
            },
          },
        },
      };
      sinon.stub(usecases, 'attachTargetProfilesToOrganization');
      sinon.stub(organizationAttachTargetProfilesSerializer, 'serialize');
    });

    it('should return 201 when some target profiles are attached', async function () {
      // given
      const serializer = Symbol('organizationAttachTargetProfilesSerializer');
      organizationAttachTargetProfilesSerializer.serialize.returns(serializer);
      usecases.attachTargetProfilesToOrganization
        .withArgs({ organizationId, targetProfileIdsToAttach: targetProfilesToAttachAsArray })
        .resolves({ attachedIds: targetProfilesToAttachAsArray });

      // when
      const response = await organizationController.attachTargetProfiles(request, hFake);

      // then
      expect(organizationAttachTargetProfilesSerializer.serialize).to.have.been.called;
      expect(response.source).to.equal(serializer);
      expect(response.statusCode).to.equal(201);
    });

    it('should return 200 when no target profiles was attached', async function () {
      // given
      const serializer = Symbol('organizationAttachTargetProfilesSerializer');
      organizationAttachTargetProfilesSerializer.serialize.returns(serializer);
      usecases.attachTargetProfilesToOrganization
        .withArgs({ organizationId, targetProfileIdsToAttach: targetProfilesToAttachAsArray })
        .resolves({ attachedIds: [], duplicatedIds: targetProfilesToAttachAsArray });

      // when
      const response = await organizationController.attachTargetProfiles(request, hFake);

      // then
      expect(organizationAttachTargetProfilesSerializer.serialize).to.have.been.called;
      expect(response.source).to.equal(serializer);
      expect(response.statusCode).to.equal(200);
    });
  });

  describe('#findPaginatedFilteredSchoolingRegistrations', function () {
    const connectedUserId = 1;
    const organizationId = 145;

    let studentWithUserInfo;
    let serializedStudentsWithUsersInfos;
    let request;

    beforeEach(function () {
      request = {
        auth: { credentials: { userId: connectedUserId } },
        params: { id: organizationId },
      };

      sinon.stub(usecases, 'findPaginatedFilteredSchoolingRegistrations');
      sinon.stub(userWithSchoolingRegistrationSerializer, 'serialize');

      studentWithUserInfo = domainBuilder.buildUserWithSchoolingRegistration();
      serializedStudentsWithUsersInfos = {
        data: [
          {
            ...studentWithUserInfo,
            isAuthenticatedFromGAR: false,
          },
        ],
      };
    });

    it('should call the usecase to find students with users infos related to the organization id', async function () {
      // given
      usecases.findPaginatedFilteredSchoolingRegistrations.resolves({});

      // when
      await organizationController.findPaginatedFilteredSchoolingRegistrations(request, hFake);

      // then
      expect(usecases.findPaginatedFilteredSchoolingRegistrations).to.have.been.calledWith({
        organizationId,
        filter: {},
        page: {},
      });
    });

    it('should call the usecase to find students with users infos related to filters', async function () {
      // given
      request = {
        ...request,
        query: {
          'filter[lastName]': 'Bob',
          'filter[firstName]': 'Tom',
          'filter[connexionType]': 'email',
          'filter[divisions][]': 'D1',
          'filter[group]': 'L1',
        },
      };
      usecases.findPaginatedFilteredSchoolingRegistrations.resolves({});

      // when
      await organizationController.findPaginatedFilteredSchoolingRegistrations(request, hFake);

      // then
      expect(usecases.findPaginatedFilteredSchoolingRegistrations).to.have.been.calledWith({
        organizationId,
        filter: { lastName: 'Bob', firstName: 'Tom', connexionType: 'email', divisions: ['D1'], group: 'L1' },
        page: {},
      });
    });

    it('should call the usecase to find students with users infos related to pagination', async function () {
      // given
      request = { ...request, query: { 'page[size]': 10, 'page[number]': 1 } };
      usecases.findPaginatedFilteredSchoolingRegistrations.resolves({});

      // when
      await organizationController.findPaginatedFilteredSchoolingRegistrations(request, hFake);

      // then
      expect(usecases.findPaginatedFilteredSchoolingRegistrations).to.have.been.calledWith({
        organizationId,
        filter: {},
        page: { size: 10, number: 1 },
      });
    });

    it('should return the serialized students belonging to the organization', async function () {
      // given
      usecases.findPaginatedFilteredSchoolingRegistrations.resolves({ data: [studentWithUserInfo] });
      userWithSchoolingRegistrationSerializer.serialize.returns(serializedStudentsWithUsersInfos);

      // when
      const response = await organizationController.findPaginatedFilteredSchoolingRegistrations(request, hFake);

      // then
      expect(response).to.deep.equal(serializedStudentsWithUsersInfos);
    });
  });

  describe('#importSchoolingRegistrationsFromSIECLE', function () {
    it('should call the usecase to import schoolingRegistrations', async function () {
      // given
      const connectedUserId = 1;
      const organizationId = 145;
      const payload = { path: 'path-to-file' };
      const format = 'xml';
      const i18n = getI18n();

      const request = {
        auth: { credentials: { userId: connectedUserId } },
        params: { id: organizationId },
        query: { format },
        payload: { path: 'path-to-file' },
        i18n,
      };

      sinon.stub(usecases, 'importSchoolingRegistrationsFromSIECLEFormat');

      usecases.importSchoolingRegistrationsFromSIECLEFormat.resolves();

      // when
      await organizationController.importSchoolingRegistrationsFromSIECLE(request, hFake);

      // then
      expect(usecases.importSchoolingRegistrationsFromSIECLEFormat).to.have.been.calledWith({
        organizationId,
        payload,
        format,
        i18n,
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
    it('should call the usecase to cancel invitation with organizationInvitationId', async function () {
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
      expect(response.source).to.equal(serializedResponse);
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

  describe('#getSchoolingRegistrationsCsvTemplate', function () {
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
      sinon.stub(usecases, 'getSchoolingRegistrationsCsvTemplate').resolves('template');
      sinon.stub(tokenService, 'extractUserId').returns(userId);
    });

    it('should return a response with correct headers', async function () {
      // when
      request.i18n = getI18n();
      const response = await organizationController.getSchoolingRegistrationsCsvTemplate(request, hFake);

      // then
      expect(response.headers['Content-Type']).to.equal('text/csv;charset=utf-8');
      expect(response.headers['Content-Disposition']).to.equal('attachment; filename=modele-import.csv');
    });
  });

  describe('#downloadCertificationResults', function () {
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

      sinon.stub(momentProto, 'format');
      momentProto.format.withArgs('YYYYMMDD').returns('20210101');

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
      expect(response.headers['Content-Disposition']).to.equal('attachment; filename=20210101_resultats_3èmeA.csv');
    });
  });

  describe('#downloadCertificationAttestationsForDivision', function () {
    it('should return binary attestations', async function () {
      // given
      const certifications = [
        domainBuilder.buildPrivateCertificateWithCompetenceTree(),
        domainBuilder.buildPrivateCertificateWithCompetenceTree(),
      ];
      const organizationId = domainBuilder.buildOrganization().id;
      const division = '3b';
      const attestationsPDF = 'binary string';

      sinon.stub(momentProto, 'format');
      momentProto.format.withArgs('YYYYMMDD').returns('20210101');

      const fileName = '20210101_attestations_3b.pdf';
      const userId = 1;

      const request = {
        auth: { credentials: { userId } },
        params: { id: organizationId },
        query: { division },
      };

      sinon.stub(usecases, 'findCertificationAttestationsForDivision');
      sinon
        .stub(certificationAttestationPdf, 'getCertificationAttestationsPdfBuffer')
        .resolves({ buffer: attestationsPDF, fileName });
      usecases.findCertificationAttestationsForDivision.resolves(certifications);

      // when
      const response = await organizationController.downloadCertificationAttestationsForDivision(request, hFake);

      // then
      expect(usecases.findCertificationAttestationsForDivision).to.have.been.calledWith({
        division,
        organizationId,
      });
      expect(response.source).to.deep.equal(attestationsPDF);
      expect(response.headers['Content-Disposition']).to.contains('attachment; filename=20210101_attestations_3b.pdf');
    });
  });

  describe('#getOrganizationMembers', function () {
    it('should return all members of the organization serialized', async function () {
      // given
      const organizationId = 1234;
      const members = Symbol('members');
      const serializedMembers = Symbol('members serialized');

      sinon.stub(usecases, 'getOrganizationMembers');
      sinon.stub(organizationMembersSerializer, 'serialize');
      usecases.getOrganizationMembers.withArgs({ organizationId }).returns(members);
      organizationMembersSerializer.serialize.withArgs(members).returns(serializedMembers);

      // when
      const request = { params: { id: organizationId } };
      const result = await organizationController.getOrganizationMembers(request, hFake);

      // then
      expect(result).to.be.equal(serializedMembers);
    });
  });
});
