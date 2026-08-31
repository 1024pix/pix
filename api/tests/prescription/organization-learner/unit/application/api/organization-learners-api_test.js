import { expect } from 'chai';
import sinon from 'sinon';

import { OrganizationLearner } from '../../../../../../src/prescription/organization-learner/application/api/models/OrganizationLearner.js';
import * as organizationLearnersApi from '../../../../../../src/prescription/organization-learner/application/api/organization-learners-api.js';
import { OrganizationLearnerWithOrganization } from '../../../../../../src/prescription/organization-learner/application/api/read-models/OrganizationLearnerWithOrganization.js';
import { usecases } from '../../../../../../src/prescription/organization-learner/domain/usecases/index.js';

describe('Unit | API | Organization Learner', function () {
  describe('#find', function () {
    context('when there is no pagination', function () {
      it('should call the usecase several times until all learners have been retrieved', async function () {
        const organizationId = 3;
        const organizationLearner1 = {
          id: 1242,
          firstName: 'Paul',
          lastName: 'Henri',
          'Libellé classe': '3ème',
          organizationId,
        };
        const expectedOrganizationLearner1 = new OrganizationLearner(organizationLearner1);
        const organizationLearner2 = {
          id: 1243,
          firstName: 'Pierre',
          lastName: 'Jacques',
          'Libellé classe': '3ème',
          organizationId,
        };
        const expectedOrganizationLearner2 = new OrganizationLearner(organizationLearner2);

        const getPaginatedOrganizationLearnerStub = sinon.stub(usecases, 'findPaginatedOrganizationLearners');
        getPaginatedOrganizationLearnerStub
          .withArgs({
            organizationId,
            page: { size: 100, number: 1 },
            filter: undefined,
          })
          .resolves({
            learners: [organizationLearner1],
            pagination: { pageSize: 1, pageCount: 2, rowCount: 2, page: 1 },
          });

        getPaginatedOrganizationLearnerStub
          .withArgs({
            organizationId,
            page: { size: 100, number: 2 },
            filter: undefined,
          })
          .resolves({
            learners: [organizationLearner2],
            pagination: { pageSize: 1, pageCount: 2, rowCount: 2, page: 2 },
          });

        // when
        const { organizationLearners, pagination } = await organizationLearnersApi.find({
          organizationId,
        });

        // then
        expect(getPaginatedOrganizationLearnerStub.calledTwice).to.be.true;
        expect(organizationLearners).have.deep.members([expectedOrganizationLearner1, expectedOrganizationLearner2]);
        expect(pagination).to.be.undefined;
      });
    });

    context('when there is a pagination', function () {
      it('should return all learners corresponding to the pagination', async function () {
        const organizationId = 3;
        const organizationLearner1 = {
          id: 1242,
          firstName: 'Paul',
          lastName: 'Henri',
          'Libellé classe': '3ème',
          organizationId,
        };
        const expectedOrganizationLearner1 = new OrganizationLearner(organizationLearner1);

        const getPaginatedOrganizationLearnerStub = sinon.stub(usecases, 'findPaginatedOrganizationLearners');
        getPaginatedOrganizationLearnerStub
          .withArgs({
            organizationId,
            page: { size: 1, number: 1 },
            filter: undefined,
          })
          .resolves({
            learners: [organizationLearner1],
            pagination: { pageSize: 1, pageCount: 1, rowCount: 1, page: 1 },
          });

        // when
        const result = await organizationLearnersApi.find({
          organizationId,
          page: { size: 1, number: 1 },
        });

        // then
        expect(result.organizationLearners).have.deep.members([expectedOrganizationLearner1]);
        expect(result.pagination).to.deep.equal({ pageSize: 1, pageCount: 1, rowCount: 1, page: 1 });
      });
    });

    context('when there is a filter', function () {
      it("should map the filter keys into attributes' names", async function () {
        const organizationId = 3;
        const organizationLearner1 = {
          id: 1242,
          firstName: 'Paul',
          lastName: 'Henri',
          'Libellé classe': '3ème',
          organizationId,
        };
        const expectedOrganizationLearner1 = new OrganizationLearner(organizationLearner1);

        const getPaginatedOrganizationLearnerStub = sinon.stub(usecases, 'findPaginatedOrganizationLearners');
        getPaginatedOrganizationLearnerStub.resolves({
          learners: [organizationLearner1],
          pagination: { pageSize: 1, pageCount: 1, rowCount: 1, page: 1 },
        });

        // when
        const result = await organizationLearnersApi.find({
          organizationId,
          filter: { divisions: ['div-2'], name: 'Paul' },
        });

        // then
        expect(result.organizationLearners).have.deep.members([expectedOrganizationLearner1]);
        expect(getPaginatedOrganizationLearnerStub).to.have.been.calledWith({
          organizationId,
          page: { size: 100, number: 1 },
          filter: { 'Libellé classe': ['div-2'], name: 'Paul' },
        });
      });
    });
  });

  describe('#get', function () {
    it('should return the learner corresponding to the id', async function () {
      const organizationLearner = {
        id: 1242,
        firstName: 'Paul',
        lastName: 'Henri',
        'Libellé classe': '3ème',
        organizationId: 356,
      };

      const getOrganizationLearnerStub = sinon.stub(usecases, 'getOrganizationLearner');
      getOrganizationLearnerStub
        .withArgs({ organizationLearnerId: organizationLearner.id })
        .resolves(organizationLearner);

      // when
      const learner = await organizationLearnersApi.get(organizationLearner.id);

      // then
      expect(learner).to.be.instanceOf(OrganizationLearner);
      expect(learner.id).to.equal(1242);
    });
  });

  describe('#findWithOrganizationByUserId', function () {
    it('should return organization learners mapped to OrganizationLearnerWithOrganization DTOs', async function () {
      // given
      const userId = 1;
      const organization = { id: 10, isManagingStudents: true, type: 'SCO', tags: ['tag1'] };
      sinon.stub(usecases, 'findOrganizationLearnersWithOrganizationByUserId').resolves([
        { organizationLearner: { id: 100 }, organization },
        { organizationLearner: { id: 200 }, organization },
      ]);

      // when
      const results = await organizationLearnersApi.findWithOrganizationByUserId({ userId });

      // then
      expect(usecases.findOrganizationLearnersWithOrganizationByUserId).to.have.been.calledOnceWith({ userId });
      expect(results).to.deep.equal([
        new OrganizationLearnerWithOrganization({ organizationLearner: { id: 100 }, organization }),
        new OrganizationLearnerWithOrganization({ organizationLearner: { id: 200 }, organization }),
      ]);
    });

    it('should return an empty array when no learners found', async function () {
      // given
      const userId = 999;
      sinon.stub(usecases, 'findOrganizationLearnersWithOrganizationByUserId').resolves([]);

      // when
      const results = await organizationLearnersApi.findWithOrganizationByUserId({ userId });

      // then
      expect(results).to.deep.equal([]);
    });
  });
});
