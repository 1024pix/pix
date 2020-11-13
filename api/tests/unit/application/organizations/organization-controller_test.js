const { expect, sinon, domainBuilder, hFake } = require('../../../test-helper');

const Organization = require('../../../../lib/domain/models/Organization');

const organizationController = require('../../../../lib/application/organizations/organization-controller');

const usecases = require('../../../../lib/domain/usecases');
const organizationService = require('../../../../lib/domain/services/organization-service');
const tokenService = require('../../../../lib/domain/services/token-service');

const campaignSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign-serializer');
const organizationInvitationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/organization-invitation-serializer');
const organizationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/organization-serializer');
const targetProfileSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/target-profile-serializer');
const userWithSchoolingRegistrationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/user-with-schooling-registration-serializer');

const queryParamsUtils = require('../../../../lib/infrastructure/utils/query-params-utils');

describe('Unit | Application | Organizations | organization-controller', () => {

  let request;

  describe('#getOrganizationDetails', () => {

    beforeEach(() => {
      sinon.stub(usecases, 'getOrganizationDetails');
      sinon.stub(organizationSerializer, 'serialize');
    });

    it('should call the usecase and serialize the response', async () => {
      // given
      const organizationId = 1234;
      request = { params: { id: organizationId } };

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

  describe('#create', () => {

    beforeEach(() => {

      sinon.stub(usecases, 'createOrganization');
      sinon.stub(organizationSerializer, 'serialize');

      request = {
        payload: {
          data: {
            attributes: {
              name: 'Acme',
              type: 'PRO',
            },
          },
        },
      };
    });

    context('successful case', () => {

      let savedOrganization;
      let serializedOrganization;

      beforeEach(() => {
        savedOrganization = domainBuilder.buildOrganization();
        serializedOrganization = { foo: 'bar' };

        usecases.createOrganization.resolves(savedOrganization);
        organizationSerializer.serialize.withArgs(savedOrganization).returns(serializedOrganization);
      });

      it('should create an organization', async () => {
        // when
        await organizationController.create(request, hFake);

        // then
        expect(usecases.createOrganization).to.have.been.calledOnce;
        expect(usecases.createOrganization).to.have.been.calledWithMatch({ name: 'Acme', type: 'PRO' });
      });

      it('should serialized organization into JSON:API', async () => {
        // when
        await organizationController.create(request, hFake);

        // then
        expect(organizationSerializer.serialize).to.have.been.calledOnce;
        expect(organizationSerializer.serialize).to.have.been.calledWith(savedOrganization);
      });

      it('should return the serialized organization', async () => {
        // when
        const response = await organizationController.create(request, hFake);

        // then
        expect(response).to.deep.equal(serializedOrganization);
      });
    });
  });

  describe('#updateOrganizationInformation', () => {

    let organization;

    beforeEach(() => {
      organization = domainBuilder.buildOrganization();
      sinon.stub(usecases, 'updateOrganizationInformation');
      sinon.stub(organizationSerializer, 'serialize');

      request = {
        payload: {
          data: {
            id: organization.id,
            attributes: {
              name: 'Acme',
              type: 'SCO',
              'logo-url': 'logo',
              'external-id': '02A2145V',
              'province-code': '02A',
              email: 'sco.generic.newaccount@example.net',
              credit: 50,
            },
          },
        },
      };
    });

    context('successful case', () => {

      let serializedOrganization;

      beforeEach(() => {
        serializedOrganization = { foo: 'bar' };

        usecases.updateOrganizationInformation.resolves(organization);
        organizationSerializer.serialize.withArgs(organization).returns(serializedOrganization);
      });

      it('should update an organization', async () => {
        // when
        await organizationController.updateOrganizationInformation(request, hFake);

        // then
        expect(usecases.updateOrganizationInformation).to.have.been.calledOnce;
        expect(usecases.updateOrganizationInformation).to.have.been.calledWithMatch({ id: organization.id, name: 'Acme', type: 'SCO', logoUrl: 'logo', externalId: '02A2145V', provinceCode: '02A', email: 'sco.generic.newaccount@example.net', credit: 50 });
      });

      it('should serialized organization into JSON:API', async () => {
        // when
        await organizationController.updateOrganizationInformation(request, hFake);

        // then
        expect(organizationSerializer.serialize).to.have.been.calledOnce;
        expect(organizationSerializer.serialize).to.have.been.calledWith(organization);
      });

      it('should return the serialized organization', async () => {
        // when
        const response = await organizationController.updateOrganizationInformation(request, hFake);

        // then
        expect(response).to.deep.equal(serializedOrganization);
      });
    });
  });

  describe('#findPaginatedFilteredOrganizations', () => {

    beforeEach(() => {
      sinon.stub(queryParamsUtils, 'extractParameters');
      sinon.stub(usecases, 'findPaginatedFilteredOrganizations');
      sinon.stub(organizationSerializer, 'serialize');
    });

    it('should return a list of JSON API organizations fetched from the data repository', async () => {
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

    it('should return a JSON API response with pagination information in the data field "meta"', async () => {
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

    it('should allow to filter organization by name', async () => {
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

    it('should allow to filter organization by code', async () => {
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

    it('should allow to filter users by type', async () => {
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

    it('should allow to paginate on a given page and page size', async () => {
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

  describe('#findPaginatedFilteredCampaigns', () => {

    let organizationId;
    let request;
    let campaign;
    let serializedCampaigns;

    beforeEach(() => {
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
      sinon.stub(campaignSerializer, 'serialize');
    });

    it('should call the usecase to get the campaigns and associated campaignReports', async () => {
      // given
      request.query = {
        campaignReport: true,
      };
      const expectedPage = 2;
      const expectedFilter = { name: 'Math' };
      queryParamsUtils.extractParameters.withArgs(request.query).returns({ page: expectedPage, filter: expectedFilter });
      const expectedResults = [campaign];
      const expectedPagination = { page: expectedPage, pageSize: 25, itemsCount: 100, pagesCount: 4 };
      usecases.findPaginatedFilteredOrganizationCampaigns.resolves({ models: expectedResults, pagination: expectedPagination });
      campaignSerializer.serialize.returns({ data: serializedCampaigns, meta: {} });

      // when
      await organizationController.findPaginatedFilteredCampaigns(request, hFake);

      // then
      expect(usecases.findPaginatedFilteredOrganizationCampaigns).to.have.been.calledWith({ organizationId, filter: expectedFilter, page: expectedPage });
    });

    it('should return the serialized campaigns belonging to the organization', async () => {
      // given
      request.query = {};
      const expectedResponse = { data: serializedCampaigns, meta: {} };
      queryParamsUtils.extractParameters.withArgs({}).returns({ filter: {} });
      usecases.findPaginatedFilteredOrganizationCampaigns.resolves({ models: {}, pagination: {} });
      campaignSerializer.serialize.returns(expectedResponse);

      // when
      const response = await organizationController.findPaginatedFilteredCampaigns(request, hFake);

      // then
      expect(response).to.deep.equal(expectedResponse);
    });

    it('should return a JSON API response with meta information', async () => {
      // given
      request.query = {};
      const expectedResults = [campaign];
      const expectedPagination = { page: 2, pageSize: 25, itemsCount: 100, pagesCount: 4, hasCampaigns: true };
      const expectedConfig = { ignoreCampaignReportRelationshipData: false };
      queryParamsUtils.extractParameters.withArgs({}).returns({ filter: {} });
      usecases.findPaginatedFilteredOrganizationCampaigns.resolves({ models: expectedResults, meta: expectedPagination });

      // when
      await organizationController.findPaginatedFilteredCampaigns(request, hFake);

      // then
      expect(campaignSerializer.serialize).to.have.been.calledWithExactly(expectedResults, expectedPagination, expectedConfig);
    });
  });

  describe('#findTargetProfiles', () => {
    const connectedUserId = 1;
    const organizationId = '145';
    let foundTargetProfiles;

    beforeEach(() => {
      request = {
        auth: { credentials: { userId: connectedUserId } },
        params: { id: organizationId },
      };

      foundTargetProfiles = [domainBuilder.buildTargetProfile()];

      sinon.stub(organizationService, 'findAllTargetProfilesAvailableForOrganization');
      sinon.stub(targetProfileSerializer, 'serialize');
    });

    context('success cases', () => {
      it('should reply 200 with serialized target profiles', async () => {
        // given
        organizationService.findAllTargetProfilesAvailableForOrganization.withArgs(145).resolves(foundTargetProfiles);
        targetProfileSerializer.serialize.withArgs(foundTargetProfiles).returns({});

        // when
        const response = await organizationController.findTargetProfiles(request, hFake);

        // then
        expect(response).to.deep.equal({});
      });
    });
  });

  describe('#attachTargetProfiles', () => {
    const userId = 1;
    const targetProfile = domainBuilder.buildTargetProfile();

    const organizationId = targetProfile.organizationId;
    const targetProfileId = targetProfile.id.toString();
    const targetProfilesToAttachAsArray = [targetProfileId];

    beforeEach(() => {
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
    });

    it('should call the usecase to attach targetProfiles to organization with organizationId and targetProfilesToAttach', async () => {
      // given
      usecases.attachTargetProfilesToOrganization.withArgs({ organizationId, targetProfilesToAttach: targetProfilesToAttachAsArray }).resolves();

      // when
      const result = await organizationController.attachTargetProfiles(request, hFake);

      // then
      expect(result.statusCode).to.equal(204);
    });
  });

  describe('#findPaginatedFilteredSchoolingRegistrations', () => {

    const connectedUserId = 1;
    const organizationId = 145;

    let studentWithUserInfo;
    let serializedStudentsWithUsersInfos;

    beforeEach(() => {
      request = {
        auth: { credentials: { userId: connectedUserId } },
        params: { id: organizationId.toString() },
      };

      sinon.stub(usecases, 'findPaginatedFilteredSchoolingRegistrations');
      sinon.stub(userWithSchoolingRegistrationSerializer, 'serialize');

      studentWithUserInfo = domainBuilder.buildUserWithSchoolingRegistration();
      serializedStudentsWithUsersInfos = {
        data: [{
          ...studentWithUserInfo,
          isAuthenticatedFromGAR: false,
        }],
      };
    });

    it('should call the usecase to find students with users infos related to the organization id', async () => {
      // given
      usecases.findPaginatedFilteredSchoolingRegistrations.resolves({});

      // when
      await organizationController.findPaginatedFilteredSchoolingRegistrations(request, hFake);

      // then
      expect(usecases.findPaginatedFilteredSchoolingRegistrations).to.have.been.calledWith({ organizationId, filter: {}, page: {} });
    });

    it('should call the usecase to find students with users infos related to filters', async () => {
      // given
      request = { ...request, query: { 'filter[lastName]': 'Bob', 'filter[firstName]': 'Tom', 'filter[connexionType]': 'email' } };
      usecases.findPaginatedFilteredSchoolingRegistrations.resolves({});

      // when
      await organizationController.findPaginatedFilteredSchoolingRegistrations(request, hFake);

      // then
      expect(usecases.findPaginatedFilteredSchoolingRegistrations).to.have.been.calledWith({
        organizationId,
        filter: { lastName: 'Bob', firstName: 'Tom', connexionType: 'email' },
        page: {},
      });
    });

    it('should call the usecase to find students with users infos related to pagination', async () => {
      // given
      request = { ...request, query: { 'page[size]': 10, 'page[number]': 1 } };
      usecases.findPaginatedFilteredSchoolingRegistrations.resolves({});

      // when
      await organizationController.findPaginatedFilteredSchoolingRegistrations(request, hFake);

      // then
      expect(usecases.findPaginatedFilteredSchoolingRegistrations).to.have.been.calledWith({ organizationId, filter: {}, page: { size: 10, number: 1 } });
    });

    it('should return the serialized students belonging to the organization', async () => {
      // given
      usecases.findPaginatedFilteredSchoolingRegistrations.resolves({ data: [studentWithUserInfo] });
      userWithSchoolingRegistrationSerializer.serialize.returns(serializedStudentsWithUsersInfos);

      // when
      const response = await organizationController.findPaginatedFilteredSchoolingRegistrations(request, hFake);

      // then
      expect(response).to.deep.equal(serializedStudentsWithUsersInfos);
    });
  });

  describe('#importSchoolingRegistrationsFromSIECLE', () => {

    const connectedUserId = 1;
    const organizationId = 145;
    const payload = { path: 'path-to-file' };
    const format = 'xml';

    beforeEach(() => {
      request = {
        auth: { credentials: { userId: connectedUserId } },
        params: { id: organizationId.toString() },
        query: { format },
        payload: { path: 'path-to-file' },
      };

      sinon.stub(usecases, 'importSchoolingRegistrationsFromSIECLEFormat');
    });

    it('should call the usecase to import schoolingRegistrations', async () => {
      // given
      usecases.importSchoolingRegistrationsFromSIECLEFormat.resolves();

      // when
      await organizationController.importSchoolingRegistrationsFromSIECLE(request, hFake);

      // then
      expect(usecases.importSchoolingRegistrationsFromSIECLEFormat).to.have.been.calledWith({ organizationId, payload, format });
    });
  });

  describe('#sendInvitations', () => {

    const userId = 1;
    const invitation = domainBuilder.buildOrganizationInvitation();

    const organizationId = invitation.organizationId;
    const emails = [invitation.email];
    const locale = 'fr-fr';

    beforeEach(() => {
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

      sinon.stub(usecases, 'createOrganizationInvitations').resolves([{ id: 1 }]);
    });

    it('should call the usecase to create invitation with organizationId, email and locale', async () => {
      // when
      await organizationController.sendInvitations(request, hFake);

      // then
      expect(usecases.createOrganizationInvitations).to.have.been.calledWith({ organizationId, emails, locale });
    });
  });

  describe('#findPendingInvitations', () => {

    const userId = 1;
    const organization = domainBuilder.buildOrganization();

    const resolvedOrganizationInvitations = 'organization invitations';
    const serializedOrganizationInvitations = 'serialized organization invitations';

    beforeEach(() => {
      request = {
        auth: { credentials: { userId } },
        params: { id: organization.id },
      };

      sinon.stub(usecases, 'findPendingOrganizationInvitations');
      sinon.stub(organizationInvitationSerializer, 'serialize');

      usecases.findPendingOrganizationInvitations.resolves(resolvedOrganizationInvitations);
      organizationInvitationSerializer.serialize.resolves(serializedOrganizationInvitations);
    });

    it('should call the usecase to find pending invitations with organizationId', async () => {
      // when
      const response = await organizationController.findPendingInvitations(request, hFake);

      // then
      expect(usecases.findPendingOrganizationInvitations).to.have.been.calledWith({ organizationId: organization.id });
      expect(organizationInvitationSerializer.serialize).to.have.been.calledWith(resolvedOrganizationInvitations);
      expect(response).to.deep.equal(serializedOrganizationInvitations);
    });
  });

  describe('#getSchoolingRegistrationsCsvTemplate', () => {
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

    beforeEach(() => {
      sinon.stub(usecases, 'getSchoolingRegistrationsCsvTemplate').resolves('template');
      sinon.stub(tokenService, 'extractUserId').returns(userId);
    });

    it('should return a response with correct headers', async () => {
      // when
      const response = await organizationController.getSchoolingRegistrationsCsvTemplate(request, hFake);

      // then
      expect(response.headers['Content-Type']).to.equal('text/csv;charset=utf-8');
      expect(response.headers['Content-Disposition']).to.equal('attachment; filename=modele-import.csv');
    });
  });
});
