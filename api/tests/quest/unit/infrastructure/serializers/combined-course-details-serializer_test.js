import { combinedCourseDetailsSerializer } from '../../../../../src/quest/infrastructure/serializers/combined-course-details-serializer.js';
import { expect } from '../../../../test-helper.js';
import { domainBuilder } from '../../../../tooling/domain-builder/domain-builder.js';

describe('Quest | Unit | Infrastructure | Serializers | combined-course-details', function () {
  it('#serialize', async function () {
    // given
    const combinedCourseDetails = domainBuilder.buildCombinedCourseDetails({
      name: 'Mon parcours',
      code: 'COMBINIX1',
      combinedCourseItems: [{ campaignId: 1 }, { moduleId: 7 }],
    });

    // when
    const serializedCombinedCourseDetails = combinedCourseDetailsSerializer.serialize(combinedCourseDetails);

    // then
    expect(serializedCombinedCourseDetails).to.deep.equal({
      data: {
        attributes: {
          name: 'Mon parcours',
          code: 'COMBINIX1',
          'has-campaigns': true,
          'has-modules': true,
          'campaign-ids': [1],
        },
        relationships: {
          'combined-course-participations': {
            links: {
              related: '/api/combined-courses/1/participations',
            },
          },
          'combined-course-statistics': {
            links: {
              related: '/api/combined-courses/1/statistics',
            },
          },
        },
        type: 'combined-courses',
        id: '1',
      },
    });
  });
});
