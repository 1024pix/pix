import { learnerListController } from '../../../../../src/prescription/organization-learner/application/learner-list-controller.js';
import { usecases } from '../../../../../src/prescription/organization-learner/domain/usecases/index.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Application | learner-list-controller', function () {
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
      const response = await learnerListController.getDivisions(request, hFake);

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

  describe('#findPaginatedFilteredParticipants', function () {
    const connectedUserId = 1;
    const organizationId = 145;

    let request;
    let dependencies;

    beforeEach(function () {
      request = {
        auth: { credentials: { userId: connectedUserId } },
        params: { organizationId },
      };

      sinon.stub(usecases, 'findPaginatedFilteredParticipants');
      const organizationParticipantsSerializerStub = { serialize: sinon.stub() };
      dependencies = {
        organizationParticipantsSerializer: organizationParticipantsSerializerStub,
      };
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

      usecases.findPaginatedFilteredParticipants
        .withArgs({ organizationId, page: 2, filters: parameters.filter, sort: {}, extraFilters: {} })
        .returns({
          organizationParticipants: [participant],
          pagination: expectedPagination,
        });
      dependencies.organizationParticipantsSerializer.serialize
        .withArgs({
          organizationParticipants: [participant],
          pagination: expectedPagination,
        })
        .returns(expectedResponse);

      // when
      const response = await learnerListController.findPaginatedFilteredParticipants(request, hFake, dependencies);

      // then
      expect(response).to.deep.equal(expectedResponse);
    });

    it('should call the usecase to find sco participants with users infos related to sort', async function () {
      // given
      request = {
        ...request,
        query: {
          sort: {
            participationCount: 'asc',
            lastnameSort: 'asc',
            latestParticipationOrder: 'asc',
          },
          filter: {},
          page: {},
        },
      };
      usecases.findPaginatedFilteredParticipants.resolves({});

      // when
      await learnerListController.findPaginatedFilteredParticipants(request, hFake, dependencies);

      // then
      expect(usecases.findPaginatedFilteredParticipants).to.have.been.calledWithExactly({
        organizationId,
        filters: {},
        extraFilters: {},
        page: {},
        sort: {
          participationCount: 'asc',
          lastnameSort: 'asc',
          latestParticipationOrder: 'asc',
        },
      });
    });

    it('map all certificability values', async function () {
      // given
      request = {
        auth: { credentials: { userId: connectedUserId } },
        params: { organizationId },
        query: {
          filter: { certificability: ['eligible', 'non-eligible', 'not-available'] },
          page: {},
          sort: {},
        },
      };
      usecases.findPaginatedFilteredParticipants.resolves({ data: [] });
      dependencies.organizationParticipantsSerializer.serialize.returns({});

      // when
      await learnerListController.findPaginatedFilteredParticipants(request, hFake, dependencies);

      // then
      expect(usecases.findPaginatedFilteredParticipants).to.have.been.calledWithExactly({
        organizationId,
        filters: { certificability: [true, false, null] },
        extraFilters: {},
        page: {},
        sort: {},
      });
    });
  });
});
