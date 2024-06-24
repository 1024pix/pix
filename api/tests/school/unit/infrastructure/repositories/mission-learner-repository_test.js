import { OrganizationLearner } from '../../../../../lib/domain/models/OrganizationLearner.js';
import { MissionLearner } from '../../../../../src/school/domain/models/MissionLearner.js';
import * as missionLearnersRepository from '../../../../../src/school/infrastructure/repositories/mission-learner-repository.js';
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
      const expectedMissionLearner = new MissionLearner(rawStudent);
      const expectedPagination = {
        page: 1,
        pageCount: 1,
        pageSize: 100,
        rowCount: 1,
      };

      organizationLearnerApiStub.find
        .withArgs({ organizationId, page: customPagination })
        .resolves({ organizationLearners: [new OrganizationLearner(rawStudent)], pagination: expectedPagination });

      const { missionLearners, pagination } = await missionLearnersRepository.findPaginatedMissionLearners({
        organizationId,
        page: customPagination,
        organizationLearnerApi: organizationLearnerApiStub,
      });

      expect(missionLearners).to.deep.equal([expectedMissionLearner]);
      expect(pagination).to.deep.equal(expectedPagination);
    });
  });
});
