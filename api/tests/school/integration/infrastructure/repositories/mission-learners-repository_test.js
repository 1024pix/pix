import { MissionLearner } from '../../../../../src/school/domain/models/MissionLearner.js';
import * as missionLearnersRepository from '../../../../../src/school/infrastructure/repositories/mission-learner-repository.js';
import { databaseBuilder, expect } from '../../../../test-helper.js';
describe('Integration | Repository | organizationLearner', function () {
  describe('#findPaginatedMissionLearners', function () {
    it('should return missionLearners corresponding to the organizationId', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const otherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      const rawStudent = databaseBuilder.factory.buildOrganizationLearner({ organizationId });
      const expectedMissionLearner = new MissionLearner(rawStudent);
      databaseBuilder.factory.buildOrganizationLearner({ organizationId: otherOrganizationId });
      await databaseBuilder.commit();

      const customPagination = { number: 1, size: 100 };
      const expectedPagination = {
        page: 1,
        pageCount: 1,
        pageSize: 100,
        rowCount: 1,
      };
      const missionLearners = await missionLearnersRepository.findPaginatedMissionLearners({
        organizationId,
        page: customPagination,
      });

      expect(missionLearners.missionLearners).to.deep.equal([expectedMissionLearner]);
      expect(missionLearners.pagination).to.deep.equal(expectedPagination);
    });

    it('should return an empty array', async function () {
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      await databaseBuilder.commit();

      const expectedPagination = {
        page: 1,
        pageCount: 0,
        pageSize: 10,
        rowCount: 0,
      };
      const missionLearners = await missionLearnersRepository.findPaginatedMissionLearners({ organizationId });

      expect(missionLearners).to.deep.equal({
        missionLearners: [],
        pagination: expectedPagination,
      });
    });
  });
});
