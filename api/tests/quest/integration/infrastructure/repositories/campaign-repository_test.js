import * as campaignRepository from '../../../../../src/quest/infrastructure/repositories/campaign-repository.js';
import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Quest | Integration | Repository | campaign', function () {
  describe('#getCampaignIdsByCombinedCourseIds', function () {
    it('should return correct campaign ids', async function () {
      const { id: campaignId } = databaseBuilder.factory.buildCampaign();
      const { id: otherCampaignId } = databaseBuilder.factory.buildCampaign();

      const { id: combinedCourseId1 } = databaseBuilder.factory.buildCombinedCourse({
        code: 'RANDOM',
        combinedCourseContents: [{ campaignId }],
      });
      const { id: combinedCourseId2 } = databaseBuilder.factory.buildCombinedCourse({ code: 'LKJHG' });
      databaseBuilder.factory.buildCombinedCourse({
        combinedCourseContents: [{ campaignId: otherCampaignId }],
      });

      await databaseBuilder.commit();

      //when
      const campaignIds = await campaignRepository.getCampaignIdsByCombinedCourseIds({
        combinedCourseIds: [combinedCourseId1, combinedCourseId2],
      });

      // then
      expect(campaignIds).to.have.lengthOf(1);
      expect(campaignIds[0]).to.deep.equal(campaignId);
    });
  });
});
