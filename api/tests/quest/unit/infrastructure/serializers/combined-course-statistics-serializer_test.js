import { CombinedCourseStatistics } from '../../../../../src/quest/domain/models/CombinedCourseStatistics.js';
import { serialize } from '../../../../../src/quest/infrastructure/serializers/combined-course-statistics-serializer.js';

describe('CombinedCourseStatisticsSerializer', function () {
  it('should serialize CombinedCourseStatistics', function () {
    const combinedCourseStatistics = new CombinedCourseStatistics({
      id: 1,
      participationsCount: 2,
      completedParticipationsCount: 1,
    });

    const serialized = serialize(combinedCourseStatistics);

    expect(serialized).to.deep.equal({
      data: {
        type: 'combined-course-statistics',
        id: '1',
        attributes: {
          'participations-count': 2,
          'completed-participations-count': 1,
        },
      },
    });
  });
});
