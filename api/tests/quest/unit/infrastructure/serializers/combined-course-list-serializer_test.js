import { CombinedCourseParticipationStatuses } from '../../../../../src/prescription/shared/domain/constants.js';
import { CombinedCourse } from '../../../../../src/quest/domain/models/combined-course/CombinedCourse.js';
import { CombinedCourseParticipation } from '../../../../../src/quest/domain/models/combined-course-participation/CombinedCourseParticipation.js';
import * as combinedCourseListSerializer from '../../../../../src/quest/infrastructure/serializers/combined-course-list-serializer.js';
import { expect } from '../../../../test-helper.js';

describe('Quest | Unit | Infrastructure | Serializers | combined-course-list', function () {
  describe('#serialize', function () {
    it('serializes an array of combined courses', function () {
      // given
      const combinedCourse1 = new CombinedCourse({
        id: 1,
        code: 'COMBINIX1',
        organizationId: 1,
        name: 'Mon parcours',
        description: 'Description 1',
        illustration: '/illustrations/image1.svg',
      });
      combinedCourse1.participations = [
        new CombinedCourseParticipation({
          status: CombinedCourseParticipationStatuses.COMPLETED,
        }),
        new CombinedCourseParticipation({
          status: CombinedCourseParticipationStatuses.STARTED,
        }),
      ];

      const combinedCourse2 = new CombinedCourse({
        id: 2,
        code: 'COMBINIX2',
        organizationId: 1,
        name: 'Autre parcours',
        description: 'Description 2',
        illustration: '/illustrations/image2.svg',
      });

      // when
      const serializedCombinedCourses = combinedCourseListSerializer.serialize([combinedCourse1, combinedCourse2]);

      // then
      expect(serializedCombinedCourses).to.deep.equal({
        data: [
          {
            attributes: {
              name: 'Mon parcours',
              code: 'COMBINIX1',
              'participations-count': 2,
              'completed-participations-count': 1,
            },
            type: 'combined-courses',
            id: '1',
          },
          {
            attributes: {
              name: 'Autre parcours',
              code: 'COMBINIX2',
              'participations-count': 0,
              'completed-participations-count': 0,
            },
            type: 'combined-courses',
            id: '2',
          },
        ],
      });
    });
  });
});
