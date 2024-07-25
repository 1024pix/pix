import { SchoolLearner } from '../../../../../src/school/domain/models/SchoolLearner.js';
import * as missionLearnersRepository from '../../../../../src/school/infrastructure/repositories/mission-learner-repository.js';
import { OrganizationLearner } from '../../../../../src/shared/domain/models/OrganizationLearner.js';
import { expect, sinon } from '../../../../test-helper.js';

describe('Unit | Repository | organizationLearner', function () {
  describe('#findPaginatedMissionLearners', function () {
    it('should return missionLearners corresponding to the organizationId', async function () {
      const organizationId = 123456;
      const rawStudent = {
        id: 1234,
        firstName: 'Léon',
        lastName: 'De Bruxelles',
        division: '4ème',
        organizationId: 23456,
      };
      const customPagination = { number: 1, size: 100 };
      const organizationLearnerApiStub = { find: sinon.stub() };
      const expectedMissionLearner = new SchoolLearner(rawStudent);
      const expectedPagination = {
        page: 1,
        pageCount: 1,
        pageSize: 100,
        rowCount: 1,
      };
      const divisionFilter = { divisions: ['4ème'] };

      organizationLearnerApiStub.find
        .withArgs({ organizationId, page: customPagination, filter: divisionFilter })
        .resolves({ organizationLearners: [new OrganizationLearner(rawStudent)], pagination: expectedPagination });

      const { missionLearners, pagination } = await missionLearnersRepository.findPaginatedMissionLearners({
        organizationId,
        page: customPagination,
        filter: divisionFilter,
        organizationLearnerApi: organizationLearnerApiStub,
      });

      expect(missionLearners).to.deep.equal([expectedMissionLearner]);
      expect(pagination).to.deep.equal(expectedPagination);
    });
  });
});
