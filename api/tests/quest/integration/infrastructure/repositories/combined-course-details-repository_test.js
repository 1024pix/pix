import { CombinedCourseDetails } from '../../../../../src/quest/domain/models/CombinedCourse.js';
import * as combinedCourseDetailsRepository from '../../../../../src/quest/infrastructure/repositories/combined-course-details-repository.js';

import { databaseBuilder } from '../../../../tooling/databases.js';

describe('Quest | Integration | Repository | combined-course-details', function () {
  describe('#findByOrganizationId', function () {
    it('should return all combined course details for a given organization', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const campaignId = databaseBuilder.factory.buildCampaign({ organizationId }).id;
      const moduleId = 'eeeb4951-6f38-4467-a4ba-0c85ed71321a';
      const combinedCourse1 = databaseBuilder.factory.buildCombinedCourse({
        code: 'COURSE1',
        name: 'Parcours 1',
        organizationId,
        combinedCourseContents: [{ campaignId }],
      });
      const combinedCourse2 = databaseBuilder.factory.buildCombinedCourse({
        code: 'COURSE2',
        name: 'Parcours 2',
        organizationId,
        combinedCourseContents: [{ moduleId: moduleId }],
      });
      await databaseBuilder.commit();

      // when
      const combinedCourses = await combinedCourseDetailsRepository.findByOrganizationId({ organizationId });

      // then
      expect(combinedCourses).lengthOf(2);
      expect(combinedCourses[0]).instanceof(CombinedCourseDetails);
      expect(combinedCourses[1]).instanceof(CombinedCourseDetails);
      expect(combinedCourses[0]).deep.equal(new CombinedCourseDetails(combinedCourse1));
      expect(combinedCourses[1]).deep.equal(new CombinedCourseDetails(combinedCourse2));
      expect(combinedCourses[0].campaignIds).deep.equal([campaignId]);
      expect(combinedCourses[1].moduleIds).deep.equal([moduleId]);
    });

    it('should return an empty array when no combined courses exist for the organization', async function () {
      // given
      const organizationId = databaseBuilder.factory.buildOrganization().id;
      const anotherOrganizationId = databaseBuilder.factory.buildOrganization().id;
      databaseBuilder.factory.buildCombinedCourse({
        code: 'COURSE1',
        name: 'Parcours 1',
        organizationId: anotherOrganizationId,
        combinedCourseContents: [{ campaignId: 123 }],
      });
      await databaseBuilder.commit();

      // when
      const combinedCourses = await combinedCourseDetailsRepository.findByOrganizationId({ organizationId });

      // then
      expect(combinedCourses).lengthOf(0);
    });
  });
});
