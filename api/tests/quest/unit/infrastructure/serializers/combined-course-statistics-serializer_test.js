import { expect } from 'chai';

import { CombinedCourseStatistics } from '../../../../../src/quest/domain/models/combined-courses/value-objects/CombinedCourseStatistics.ts';
import { combinedCourseStatisticsSerializer } from '../../../../../src/quest/infrastructure/serializers/combined-course-statistics-serializer.js';

describe('CombinedCourseStatisticsSerializer', function () {
  it('should serialize CombinedCourseStatistics', function () {
    const combinedCourseStatistics = new CombinedCourseStatistics({
      combinedCourseId: 1,
      participationsCount: 2,
      completedParticipationsCount: 1,
    });

    const serialized = combinedCourseStatisticsSerializer.serialize(combinedCourseStatistics);

    expect(serialized).to.deep.equal({
      data: {
        id: '1',
        type: 'combined-course-statistics',
        attributes: {
          'participations-count': 2,
          'completed-participations-count': 1,
        },
      },
    });
  });
});
