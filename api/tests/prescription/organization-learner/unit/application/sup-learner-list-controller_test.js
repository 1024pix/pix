import { expect, hFake, sinon } from '../../../../test-helper.js';

import { SupOrganizationParticipant } from '../../../../../src/prescription/organization-learner/domain/read-models/SupOrganizationParticipant.js';
import { supLearnerListController } from '../../../../../src/prescription/organization-learner/application/sup-learner-list-controller.js';
import { usecases } from '../../../../../src/prescription/organization-learner/domain/usecases/index.js';
import * as queryParamsUtils from '../../../../../lib/infrastructure/utils/query-params-utils.js';

describe('Unit | Application | sup-learner-list-controller', function () {
  describe('#findPaginatedFilteredSupParticipants', function () {
    const connectedUserId = 1;
    const organizationId = 145;

    let supOrganizationParticipant;
    let serializedSupOrganizationParticipant;
    let request;
    let dependencies;

    beforeEach(function () {
      request = {
        auth: { credentials: { userId: connectedUserId } },
        params: { id: organizationId },
      };

      sinon.stub(usecases, 'findPaginatedFilteredSupParticipants');

      const supOrganizationParticipantsSerializerStub = {
        serialize: sinon.stub(),
      };

      dependencies = {
        queryParamsUtils,
        supOrganizationParticipantsSerializer: supOrganizationParticipantsSerializerStub,
      };

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
      await supLearnerListController.findPaginatedFilteredSupParticipants(request, hFake, dependencies);

      // then
      expect(usecases.findPaginatedFilteredSupParticipants).to.have.been.calledWithExactly({
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
      await supLearnerListController.findPaginatedFilteredSupParticipants(request, hFake, dependencies);

      // then
      expect(usecases.findPaginatedFilteredSupParticipants).to.have.been.calledWithExactly({
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
      await supLearnerListController.findPaginatedFilteredSupParticipants(request, hFake, dependencies);

      // then
      expect(usecases.findPaginatedFilteredSupParticipants).to.have.been.calledWithExactly({
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
      await supLearnerListController.findPaginatedFilteredSupParticipants(request, hFake, dependencies);

      // then
      expect(usecases.findPaginatedFilteredSupParticipants).to.have.been.calledWithExactly({
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
      dependencies.supOrganizationParticipantsSerializer.serialize
        .withArgs({ supOrganizationParticipants, meta })
        .returns(serializedSupOrganizationParticipant);

      // when
      const response = await supLearnerListController.findPaginatedFilteredSupParticipants(
        request,
        hFake,
        dependencies,
      );

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
      dependencies.supOrganizationParticipantsSerializer.serialize.returns({});

      // when
      await supLearnerListController.findPaginatedFilteredSupParticipants(request, hFake, dependencies);

      // then
      expect(usecases.findPaginatedFilteredSupParticipants).to.have.been.calledWithExactly({
        organizationId,
        filter: { certificability: [true, false, null] },
        page: {},
        sort: {},
      });
    });
  });
});
