const { expect, sinon, domainBuilder, hFake } = require('../../../test-helper');

const Organization = require('../../../../lib/domain/models/Organization');
const SearchResultList = require('../../../../lib/domain/models/SearchResultList');
const organizationController = require('../../../../lib/application/organizations/organization-controller');
const organizationSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/organization-serializer');
const organizationService = require('../../../../lib/domain/services/organization-service');
const usecases = require('../../../../lib/domain/usecases');
const campaignSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/campaign-serializer');
const targetProfileSerializer = require('../../../../lib/infrastructure/serializers/jsonapi/target-profile-serializer');

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
            }
          }
        }
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
        expect(usecases.createOrganization).to.have.been.calledWith({ name: 'Acme', type: 'PRO' });
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

  describe('#find', () => {

    beforeEach(() => {
      sinon.stub(usecases, 'findOrganizations');
      sinon.stub(organizationSerializer, 'serialize');
    });

    afterEach(() => {
      usecases.findOrganizations.restore();
      organizationSerializer.serialize.restore();
    });

    it('should return a list of JSON API organizations fetched from the data repository', async () => {
      // given
      const request = { query: {} };
      usecases.findOrganizations.resolves(new SearchResultList());
      organizationSerializer.serialize.returns({ data: {}, meta: {} });

      // when
      await organizationController.find(request, hFake);

      // then
      expect(usecases.findOrganizations).to.have.been.calledOnce;
      expect(organizationSerializer.serialize).to.have.been.calledOnce;
    });

    it('should return a JSON API response with pagination information in the data field "meta"', async () => {
      // given
      const request = { query: {} };
      const searchResultList = new SearchResultList({
        page: 2,
        pageSize: 25,
        totalResults: 100,
        paginatedResults: [new Organization({ id: 1 }), new Organization({ id: 2 }), new Organization({ id: 3 })],
      });
      usecases.findOrganizations.resolves(searchResultList);

      // when
      await organizationController.find(request, hFake);

      // then
      const expectedResults = searchResultList.paginatedResults;
      const expectedMeta = { page: 2, pageSize: 25, itemsCount: 100, pagesCount: 4, };
      expect(organizationSerializer.serialize).to.have.been.calledWithExactly(expectedResults, expectedMeta);
    });

    it('should allow to filter organization by name', async () => {
      // given
      const request = { query: { name: 'organization_name' } };
      usecases.findOrganizations.resolves(new SearchResultList());

      // when
      await organizationController.find(request, hFake);

      // then
      const expectedFilters = { name: 'organization_name' };
      expect(usecases.findOrganizations).to.have.been.calledWithMatch({ filters: expectedFilters });
    });

    it('should allow to filter organization by code', async () => {
      // given
      const request = { query: { code: 'organization_code' } };
      usecases.findOrganizations.resolves(new SearchResultList());

      // when
      await organizationController.find(request, hFake);

      // then
      const expectedFilters = { code: 'organization_code' };
      expect(usecases.findOrganizations).to.have.been.calledWithMatch({ filters: expectedFilters });
    });

    it('should allow to filter users by type', async () => {
      // given
      const request = { query: { type: 'organization_type' } };
      usecases.findOrganizations.resolves(new SearchResultList());

      // when
      await organizationController.find(request, hFake);

      // then
      const expectedFilters = { type: 'organization_type' };
      expect(usecases.findOrganizations).to.have.been.calledWithMatch({ filters: expectedFilters });
    });

    it('should allow to paginate on a given page and page size', async () => {
      // given
      const request = { query: { page: 2, pageSize: 25 } };
      usecases.findOrganizations.resolves(new SearchResultList());

      // when
      await organizationController.find(request, hFake);

      // then
      const expectedPagination = { page: 2, pageSize: 25 };
      expect(usecases.findOrganizations).to.have.been.calledWithMatch({ pagination: expectedPagination });
    });

    it('should paginate on page 1 for a page size of 10 elements by default', async () => {
      // given
      const request = { query: {} };
      usecases.findOrganizations.resolves(new SearchResultList());

      // when
      await organizationController.find(request, hFake);

      // then
      const expectedPagination = { page: 1, pageSize: 10 };
      expect(usecases.findOrganizations).to.have.been.calledWithMatch({ pagination: expectedPagination });
    });
  });

  describe('#exportSharedSnapshotsAsCsv', () => {

    beforeEach(() => {
      sinon.stub(usecases, 'writeOrganizationSharedProfilesAsCsvToStream').resolves();
    });

    it('should call the use case service that exports shared profile of an organization as CSV (and reply an HTTP response)', async () => {
      // given
      const request = {
        params: {
          id: 7
        }
      };

      // when
      const response = await organizationController.exportSharedSnapshotsAsCsv(request, hFake);

      // then
      expect(response.headers).to.deep.equal({
        'Content-Type': 'text/csv;charset=utf-8',
        'Content-Disposition': 'attachment; filename="Pix - Export donnees partagees.csv"'
      });
    });
  });

  describe('#getCampaigns', () => {

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
            userId: 1
          }
        }
      };
      campaign = domainBuilder.buildCampaign();
      serializedCampaigns = { data: [{ name: campaign.name, code: campaign.code }] };

      sinon.stub(usecases, 'getOrganizationCampaigns');
      sinon.stub(campaignSerializer, 'serialize');
    });

    it('should call the usecase to get the campaigns without campaignReport', async () => {
      // given
      usecases.getOrganizationCampaigns.resolves([campaign]);
      campaignSerializer.serialize.returns(serializedCampaigns);

      // when
      await organizationController.getCampaigns(request, hFake);

      // then
      expect(usecases.getOrganizationCampaigns).to.have.been.calledWith({ organizationId, retrieveCampaignReport: false });
    });

    it('should call the usecase to get the campaigns and associated campaignReport', async () => {

      request.query = {
        campaignReport: true
      };

      // given
      usecases.getOrganizationCampaigns.resolves([campaign]);
      campaignSerializer.serialize.returns(serializedCampaigns);

      // when
      await organizationController.getCampaigns(request, hFake);

      // then
      expect(usecases.getOrganizationCampaigns).to.have.been.calledWith({ organizationId, retrieveCampaignReport: true });
    });

    it('should return the serialized campaigns belonging to the organization', async () => {
      // given
      usecases.getOrganizationCampaigns.resolves([campaign]);
      campaignSerializer.serialize.returns(serializedCampaigns);

      // when
      const response = await organizationController.getCampaigns(request, hFake);

      // then
      expect(response).to.deep.equal(serializedCampaigns);
    });
  });

  describe('#findTargetProfiles', () => {
    const connectedUserId = 1;
    const organizationId = '145';
    let foundTargetProfiles;

    beforeEach(() => {
      request = {
        auth: { credentials: { userId: connectedUserId } },
        params: { id: organizationId }
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
});
