import { learnerListController } from '../../../../../src/prescription/organization-learner/application/learner-list-controller.js';
import { usecases } from '../../../../../src/prescription/organization-learner/domain/usecases/index.js';
import * as queryParamsUtils from '../../../../../src/shared/infrastructure/utils/query-params-utils.js';
import { domainBuilder, expect, hFake, sinon } from '../../../../test-helper.js';

describe('Unit | Application | learner-list-controller', function () {
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

      const queryParamsUtils = { extractParameters: sinon.stub() };
      queryParamsUtils.extractParameters.withArgs(request.query).returns(parameters);

      dependencies.queryParamsUtils = queryParamsUtils;

      usecases.findPaginatedFilteredParticipants
        .withArgs({ organizationId, page: 2, filters: parameters.filter, sort: {} })
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
          'sort[participationCount]': 'asc',
          'sort[lastnameSort]': 'asc',
          'sort[latestParticipationOrder]': 'asc',
        },
      };
      usecases.findPaginatedFilteredParticipants.resolves({});
      dependencies.queryParamsUtils = queryParamsUtils;

      // when
      await learnerListController.findPaginatedFilteredParticipants(request, hFake, dependencies);

      // then
      expect(usecases.findPaginatedFilteredParticipants).to.have.been.calledWithExactly({
        organizationId,
        filters: {},
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
          'filter[certificability][]': ['eligible', 'non-eligible', 'not-available'],
        },
      };
      usecases.findPaginatedFilteredParticipants.resolves({ data: [] });
      dependencies.organizationParticipantsSerializer.serialize.returns({});
      dependencies.queryParamsUtils = queryParamsUtils;

      // when
      await learnerListController.findPaginatedFilteredParticipants(request, hFake, dependencies);

      // then
      expect(usecases.findPaginatedFilteredParticipants).to.have.been.calledWithExactly({
        organizationId,
        filters: { certificability: [true, false, null] },
        page: {},
        sort: {},
      });
    });
  });
});
