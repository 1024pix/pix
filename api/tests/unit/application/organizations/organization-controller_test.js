import { organizationController } from '../../../../lib/application/organizations/organization-controller.js';
import { usecases } from '../../../../lib/domain/usecases/index.js';
import { Organization } from '../../../../src/shared/domain/models/index.js';
import { domainBuilder, expect, generateValidRequestAuthorizationHeader, hFake, sinon } from '../../../test-helper.js';

describe('Unit | Application | Organizations | organization-controller', function () {
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

  describe('#findPaginatedFilteredOrganizations', function () {
    let dependencies;

    beforeEach(function () {
      const organizationSerializerStub = {
        serialize: sinon.stub(),
      };
      dependencies = {
        organizationSerializer: organizationSerializerStub,
      };
      sinon.stub(usecases, 'findPaginatedFilteredOrganizations');
    });

    it('should return a list of JSON API organizations fetched from the data repository', async function () {
      // given
      const request = { query: {} };
      usecases.findPaginatedFilteredOrganizations.resolves({ models: {}, pagination: {} });
      dependencies.organizationSerializer.serialize.returns({ data: {}, meta: {} });

      // when
      await organizationController.findPaginatedFilteredOrganizations(request, hFake, dependencies);

      // then
      expect(usecases.findPaginatedFilteredOrganizations).to.have.been.calledOnce;
      expect(dependencies.organizationSerializer.serialize).to.have.been.calledOnce;
    });

    it('should return a JSON API response with pagination information in the data field "meta"', async function () {
      // given
      const request = { query: {} };
      const expectedResults = [new Organization({ id: 1 }), new Organization({ id: 2 }), new Organization({ id: 3 })];
      const expectedPagination = { page: 2, pageSize: 25, itemsCount: 100, pagesCount: 4 };
      usecases.findPaginatedFilteredOrganizations.resolves({ models: expectedResults, pagination: expectedPagination });

      // when
      await organizationController.findPaginatedFilteredOrganizations(request, hFake, dependencies);

      // then
      expect(dependencies.organizationSerializer.serialize).to.have.been.calledWithExactly(
        expectedResults,
        expectedPagination,
      );
    });

    it('should allow to filter organization by name', async function () {
      // given
      const query = { filter: { name: 'organization_name' }, page: {} };
      const request = { query };
      usecases.findPaginatedFilteredOrganizations.resolves({ models: {}, pagination: {} });

      // when
      await organizationController.findPaginatedFilteredOrganizations(request, hFake, dependencies);

      // then
      expect(usecases.findPaginatedFilteredOrganizations).to.have.been.calledWithMatch(query);
    });

    it('should allow to filter organization by code', async function () {
      // given
      const query = { filter: { code: 'organization_code' }, page: {} };
      const request = { query };
      usecases.findPaginatedFilteredOrganizations.resolves({ models: {}, pagination: {} });

      // when
      await organizationController.findPaginatedFilteredOrganizations(request, hFake, dependencies);

      // then
      expect(usecases.findPaginatedFilteredOrganizations).to.have.been.calledWithMatch(query);
    });

    it('should allow to filter users by type', async function () {
      // given
      const query = { filter: { type: 'organization_type' }, page: {} };
      const request = { query };
      usecases.findPaginatedFilteredOrganizations.resolves({ models: {}, pagination: {} });

      // when
      await organizationController.findPaginatedFilteredOrganizations(request, hFake, dependencies);

      // then
      expect(usecases.findPaginatedFilteredOrganizations).to.have.been.calledWithMatch(query);
    });

    it('should allow to paginate on a given page and page size', async function () {
      // given
      const query = { filter: { name: 'organization_name' }, page: { number: 2, size: 25 } };
      const request = { query };
      usecases.findPaginatedFilteredOrganizations.resolves({ models: {}, pagination: {} });

      // when
      await organizationController.findPaginatedFilteredOrganizations(request, hFake, dependencies);

      // then
      expect(usecases.findPaginatedFilteredOrganizations).to.have.been.calledWithMatch(query);
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
              'can-detach': false,
              'created-at': undefined,
            },
          },
        ],
      });
    });
  });

  describe('#getOrganizationMemberIdentities', function () {
    it('should return all members identities of the organization serialized', async function () {
      // given
      const organizationId = 1234;
      const members = Symbol('members');
      const serializedMembersIdentities = Symbol('members serialized');

      sinon.stub(usecases, 'getOrganizationMemberIdentities').withArgs({ organizationId }).returns(members);
      const organizationMemberIdentitySerializerStub = {
        serialize: sinon.stub(),
      };
      const dependencies = {
        organizationMemberIdentitySerializer: organizationMemberIdentitySerializerStub,
      };
      organizationMemberIdentitySerializerStub.serialize.withArgs(members).returns(serializedMembersIdentities);

      // when
      const request = { params: { id: organizationId } };
      const result = await organizationController.getOrganizationMemberIdentities(request, hFake, dependencies);

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
      const organizationForAdminSerializerStub = {
        serialize: sinon.stub(),
      };

      organizationForAdminSerializerStub.serialize
        .withArgs(archivedOrganization)
        .returns(archivedOrganizationSerialized);

      const dependencies = {
        organizationForAdminSerializer: organizationForAdminSerializerStub,
      };

      // when
      const response = await organizationController.archiveOrganization(request, hFake, dependencies);

      // then
      expect(usecases.archiveOrganization).to.have.been.calledOnceWithExactly({ organizationId, userId });
      expect(response).to.deep.equal(archivedOrganizationSerialized);
    });
  });

  describe('#findChildrenOrganizationsForAdmin', function () {
    it('calls findChildrenOrganizationsForAdmin usecase and returns a serialized list of organizations', async function () {
      // given
      const parentOrganizationId = 1;
      const organizations = Symbol('child organizations list');
      const childOrganizationsSerialized = Symbol('child organizations serialized list');
      const dependencies = {
        organizationForAdminSerializer: { serialize: sinon.stub() },
      };

      sinon.stub(usecases, 'findChildrenOrganizationsForAdmin').resolves(organizations);
      dependencies.organizationForAdminSerializer.serialize.resolves(childOrganizationsSerialized);

      const request = {
        params: { organizationId: parentOrganizationId },
      };

      // when
      const response = await organizationController.findChildrenOrganizationsForAdmin(request, hFake, dependencies);

      // then
      expect(usecases.findChildrenOrganizationsForAdmin).to.have.been.calledWithExactly({ parentOrganizationId });
      expect(dependencies.organizationForAdminSerializer.serialize).to.have.been.calledWithExactly(organizations);
      expect(response).to.deep.equal(childOrganizationsSerialized);
    });
  });
});
